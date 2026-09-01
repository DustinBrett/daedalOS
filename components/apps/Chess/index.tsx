import { basename } from "path";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Chess as ChessGame } from "chess.js";
import { Chessboard2 } from "@chrisoakman/chessboard2/dist/chessboard2.min.mjs";
import stockfishLiteJsUrl from "stockfish/bin/stockfish-18-lite.js";
import stockfishLiteWasmUrl from "stockfish/bin/stockfish-18-lite.wasm";
import stockfishLiteSingleJsUrl from "stockfish/bin/stockfish-18-lite-single.js";
import stockfishLiteSingleWasmUrl from "stockfish/bin/stockfish-18-lite-single.wasm";
import StyledChess from "components/apps/Chess/StyledChess";
import {
  type Chessboard2Config,
  type Chessboard2Instance,
  type Chessboard2Orientation,
  type GameMode,
  type Side,
} from "components/apps/Chess/types";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Apps/StyledLoading";
import useTitle from "components/system/Window/useTitle";
import { useFileSystemActions } from "contexts/fileSystem";
import { useProcess } from "contexts/process";
import useResizeObserver from "hooks/useResizeObserver";
import { clsx, loadFiles } from "utils/functions";

const PIECE_THEME = "/Program Files/Chess/img/{piece}.svg";

const SKILL_LEVELS = Array.from({ length: 21 }, (_, i) => i);

const skillToMovetimeMs = (skill: number): number => 50 + skill * 100;

const sideName = (side: Side): string => (side === "w" ? "White" : "Black");

const supportsThreadedStockfish = (): boolean =>
  typeof window !== "undefined" &&
  typeof SharedArrayBuffer !== "undefined" &&
  window.crossOriginIsolated;

const stockfishUrls = (): { jsUrl: string; wasmUrl: string } =>
  supportsThreadedStockfish()
    ? { jsUrl: stockfishLiteJsUrl, wasmUrl: stockfishLiteWasmUrl }
    : {
        jsUrl: stockfishLiteSingleJsUrl,
        wasmUrl: stockfishLiteSingleWasmUrl,
      };

type Status = {
  className?: "thinking" | "over";
  text: string;
};

// chess.js v1.4's PEG grammar expects a single game; multi-game PGN exports
// (e.g. a player archive) trigger a SyntaxError on the second "[Event ...]"
// header. Strip the BOM and keep only the first game.
const PGN_GAME_SPLIT = /\n\s*\n(?=\[)/;

const firstGameOnly = (pgn: string): string => {
  const cleaned = pgn.codePointAt(0) === 0xfe_ff ? pgn.slice(1) : pgn;
  const [first] = cleaned.split(PGN_GAME_SPLIT);

  return first ?? cleaned;
};

const Chess: FC<ComponentProcessProps> = ({ id }) => {
  const { libs = [], url = "" } = useProcess(id);
  const { readFile } = useFileSystemActions();
  const { prependFileToTitle } = useTitle(id);
  const boardElRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<Chessboard2Instance | undefined>(undefined);
  const chessRef = useRef<ChessGame | undefined>(undefined);
  const workerRef = useRef<Worker | undefined>(undefined);
  const moveSeqRef = useRef(0);
  const thinkingRef = useRef(false);
  const cvcTimerRef = useRef<number | undefined>(undefined);
  const loadPromiseRef = useRef<Promise<void> | undefined>(undefined);
  const selectedSquareRef = useRef<string | undefined>(undefined);
  const justSelectedRef = useRef(false);
  const [selectedSquare, setSelectedSquare] = useState<string>();
  const detachClickRef = useRef<(() => void) | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<GameMode>("hvc");
  const [playerSide, setPlayerSide] = useState<Side>("w");
  const [skill, setSkill] = useState(5);
  const [status, setStatus] = useState<Status>({ text: "Loading..." });
  const [pgnMoves, setPgnMoves] = useState<string[]>([]);
  const [pgnIndex, setPgnIndex] = useState(-1);
  const [orientation, setOrientation] =
    useState<Chessboard2Orientation>("white");

  const modeRef = useRef(mode);
  const playerSideRef = useRef(playerSide);
  const skillRef = useRef(skill);
  const reviewRef = useRef(false);
  const orientationRef = useRef(orientation);

  modeRef.current = mode;
  playerSideRef.current = playerSide;
  skillRef.current = skill;
  reviewRef.current = pgnMoves.length > 0;
  orientationRef.current = orientation;
  selectedSquareRef.current = selectedSquare;

  const isHumanTurn = useCallback((): boolean => {
    const chess = chessRef.current;

    if (!chess) return false;
    if (modeRef.current === "hvh") return true;
    if (modeRef.current === "cvc") return false;

    return chess.turn() === playerSideRef.current;
  }, []);

  const computeStatus = useCallback((): Status => {
    const chess = chessRef.current;

    if (!chess) return { text: "Loading..." };

    if (chess.isCheckmate()) {
      const loser = chess.turn();

      return {
        className: "over",
        text: `Checkmate — ${sideName(loser === "w" ? "b" : "w")} wins`,
      };
    }
    if (chess.isStalemate()) return { className: "over", text: "Stalemate" };
    if (chess.isInsufficientMaterial()) {
      return { className: "over", text: "Draw — insufficient material" };
    }
    if (chess.isThreefoldRepetition()) {
      return { className: "over", text: "Draw — threefold repetition" };
    }
    if (chess.isDraw()) return { className: "over", text: "Draw" };

    if (!isHumanTurn() && thinkingRef.current) {
      return { className: "thinking", text: "Engine thinking…" };
    }

    return { text: `${sideName(chess.turn())} to move` };
  }, [isHumanTurn]);

  const refreshStatus = useCallback(() => {
    setStatus((prev) => {
      const next = computeStatus();

      return prev.text === next.text && prev.className === next.className
        ? prev
        : next;
    });
  }, [computeStatus]);

  const requestEngineMove = useCallback(() => {
    const chess = chessRef.current;
    const worker = workerRef.current;

    if (!chess || !worker || chess.isGameOver() || reviewRef.current) {
      thinkingRef.current = false;
      refreshStatus();
      return;
    }

    thinkingRef.current = true;
    refreshStatus();

    worker.postMessage(`setoption name Skill Level value ${skillRef.current}`);
    worker.postMessage(`position fen ${chess.fen()}`);
    worker.postMessage(`go movetime ${skillToMovetimeMs(skillRef.current)}`);
  }, [refreshStatus]);

  const applyEngineMove = useCallback(
    (uci: string) => {
      const chess = chessRef.current;
      const board = boardRef.current;

      if (!chess || !board) return;

      try {
        chess.move({
          from: uci.slice(0, 2),
          promotion: uci.length > 4 ? uci[4] : "q",
          to: uci.slice(2, 4),
        });
      } catch {
        thinkingRef.current = false;
        refreshStatus();
        return;
      }

      board.position(chess.fen(), false);
      thinkingRef.current = false;
      refreshStatus();

      if (
        !chess.isGameOver() &&
        modeRef.current === "cvc" &&
        moveSeqRef.current
      ) {
        const seq = moveSeqRef.current;

        cvcTimerRef.current = window.setTimeout(() => {
          if (seq === moveSeqRef.current) requestEngineMove();
        }, 250);
      } else if (!chess.isGameOver() && !isHumanTurn()) {
        requestEngineMove();
      }
    },
    [isHumanTurn, refreshStatus, requestEngineMove]
  );

  const onEngineMessage = useCallback(
    (event: MessageEvent<string>) => {
      const line = typeof event.data === "string" ? event.data : "";

      if (!line.startsWith("bestmove ")) return;

      const [, move] = line.split(" ");

      if (!move || move === "(none)") {
        thinkingRef.current = false;
        refreshStatus();
        return;
      }

      applyEngineMove(move);
    },
    [applyEngineMove, refreshStatus]
  );

  const stopEngine = useCallback(() => {
    if (cvcTimerRef.current !== undefined) {
      window.clearTimeout(cvcTimerRef.current);
      cvcTimerRef.current = undefined;
    }
    workerRef.current?.postMessage("stop");
    thinkingRef.current = false;
  }, []);

  const newGame = useCallback(() => {
    const chess = chessRef.current;
    const board = boardRef.current;

    if (!chess || !board) return;

    moveSeqRef.current += 1;
    stopEngine();

    setPgnMoves([]);
    setPgnIndex(-1);
    reviewRef.current = false;

    chess.reset();
    board.start(false);
    setSelectedSquare(undefined);
    board.clearCircles();

    setOrientation(
      modeRef.current === "hvc" && playerSideRef.current === "b"
        ? "black"
        : "white"
    );

    refreshStatus();

    if (!isHumanTurn()) requestEngineMove();
  }, [isHumanTurn, refreshStatus, requestEngineMove, stopEngine]);

  const jumpTo = useCallback(
    (target: number) => {
      const chess = chessRef.current;
      const board = boardRef.current;

      if (!chess || !board) return;

      const clamped = Math.max(-1, Math.min(target, pgnMoves.length - 1));

      chess.reset();
      for (let i = 0; i <= clamped; i += 1) chess.move(pgnMoves[i]);

      board.position(chess.fen(), false);
      setPgnIndex(clamped);
      refreshStatus();
    },
    [pgnMoves, refreshStatus]
  );

  useEffect(() => {
    let cancelled = false;

    if (!loadPromiseRef.current) loadPromiseRef.current = loadFiles(libs);

    const init = (): void => {
      if (cancelled || chessRef.current || !boardElRef.current) return;

      // chessboard2 derives all piece positions from boardWidth at init
      // (left/top = squareIndex/boardWidth*100). If width is 0 at this moment,
      // every piece ends up at NaN% → 0,0 stacked. Defer until layout settles.
      if (boardElRef.current.getBoundingClientRect().width === 0) {
        requestAnimationFrame(init);
        return;
      }

      const chess = new ChessGame();

      chessRef.current = chess;

      const canSelectPieceAt = (square: string): boolean => {
        if (chess.isGameOver()) return false;
        if (reviewRef.current) return false;
        if (!isHumanTurn()) return false;

        const piece = chess.get(square as Parameters<typeof chess.get>[0]);

        if (!piece) return false;

        return piece.color === chess.turn();
      };

      const selectSquare = (square: string): void => {
        const cb = boardRef.current;

        if (!cb) return;

        if (selectedSquareRef.current !== square) {
          setSelectedSquare(square);
          selectedSquareRef.current = square;
          justSelectedRef.current = true;
        }

        cb.clearCircles();

        const moves = chess.moves({
          square: square as Parameters<typeof chess.moves>[0]["square"],
          verbose: true,
        });

        for (const move of moves) {
          cb.addCircle({
            color: "#9bc700",
            opacity: 0.7,
            size: "small",
            square: move.to,
          });
        }
      };

      const clearSelection = (): void => {
        setSelectedSquare(undefined);
        boardRef.current?.clearCircles();
      };

      const tryMove = (from: string, to: string): boolean => {
        try {
          chess.move({ from, promotion: "q", to });
        } catch {
          return false;
        }

        boardRef.current?.position(chess.fen(), false);
        clearSelection();
        refreshStatus();
        if (!chess.isGameOver() && !isHumanTurn()) requestEngineMove();
        return true;
      };

      const config: Chessboard2Config = {
        draggable: true,
        onDragStart: ({ piece, square }) => {
          if (chess.isGameOver()) return false;
          if (reviewRef.current) return false;
          if (!isHumanTurn()) return false;
          if (square === "spare") return false;
          if (!piece.startsWith(chess.turn())) return false;

          // Select on mousedown so the green highlight + dots appear instantly,
          // not only after the click is fully released.
          selectSquare(square);

          return true;
        },
        onDrop: ({ source, target }) => {
          // Drag-cancel (released back on source) — keep selection so the user
          // can click a dot to commit the move.
          if (source === target) return "snapback";
          // Off-board — keep selection too; let the user retry.
          if (target === "offboard") return "snapback";

          try {
            chess.move({ from: source, promotion: "q", to: target });
          } catch {
            // Invalid drag target — snap back and keep the selection.
            return "snapback";
          }

          // Sync the board with chess.js so castle/en-passant/promotion render correctly.
          window.setTimeout(() => {
            boardRef.current?.position(chess.fen(), false);
            clearSelection();
            refreshStatus();
            if (!chess.isGameOver() && !isHumanTurn()) requestEngineMove();
          }, 0);

          return "";
        },
        orientation: orientationRef.current,
        pieceTheme: PIECE_THEME,
        position: "start",
      };

      const board = Chessboard2(boardElRef.current, config);

      boardRef.current = board;

      // Click-to-move. Resolve the square from click coords because pieces
      // sit in a sibling DOM tree and don't have a data-square-coord ancestor.
      const xyToSquare = (
        clientX: number,
        clientY: number
      ): string | undefined => {
        const el = boardElRef.current;

        if (!el) return undefined;

        const rect = el.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) return undefined;

        const fileIdx = Math.floor(((clientX - rect.left) / rect.width) * 8);
        const rankIdx = Math.floor(((clientY - rect.top) / rect.height) * 8);

        if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) {
          return undefined;
        }

        const flipped = orientationRef.current === "black";
        const file = "abcdefgh"[flipped ? 7 - fileIdx : fileIdx];
        const rank = flipped ? rankIdx + 1 : 8 - rankIdx;

        return `${file}${rank}`;
      };

      const onSquareClick = (event: MouseEvent): void => {
        const square = xyToSquare(event.clientX, event.clientY);
        const justSelected = justSelectedRef.current;

        justSelectedRef.current = false;

        if (!square) return;

        const selected = selectedSquareRef.current;

        if (!selected) {
          if (canSelectPieceAt(square)) selectSquare(square);
          return;
        }

        // Don't toggle the selection off if it was just made by this very
        // mousedown (so a plain click on a piece still ends up selected).
        if (selected === square && justSelected) return;

        if (selected === square) {
          clearSelection();
          return;
        }

        if (tryMove(selected, square)) return;

        if (canSelectPieceAt(square)) selectSquare(square);
        else clearSelection();
      };

      // chessboard2 preventDefaults touchstart/mousedown to start its own drag,
      // which suppresses the synthesized click event on both desktop and mobile
      // (and chessboard2's dragged-piece overlay sits on body so mouseup target
      // doesn't bubble back to .board). We track pointer movement between
      // pointerdown and pointerup ourselves to differentiate a pure tap/click
      // from a drag (incl. drag-cancel-back-to-source). Pointer events unify
      // mouse + touch + pen so the same handler works on Android/iOS.
      let pointerInfo:
        | { didMove: boolean; pointerId: number; x: number; y: number }
        | undefined;
      const onPointerDown = (event: PointerEvent): void => {
        pointerInfo = {
          didMove: false,
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        // Don't reset justSelectedRef here — chessboard2's pointer handler
        // fires first and may have already set it via onDragStart→selectSquare;
        // resetting here would wipe that signal. The flag is consumed in
        // onSquareClick or in the drag branch of onPointerUp.
      };
      const onPointerMove = (event: PointerEvent): void => {
        if (!pointerInfo || pointerInfo.didMove) return;
        if (event.pointerId !== pointerInfo.pointerId) return;

        const dx = event.clientX - pointerInfo.x;
        const dy = event.clientY - pointerInfo.y;

        if (Math.hypot(dx, dy) > 4) pointerInfo.didMove = true;
      };
      const onPointerUp = (event: PointerEvent): void => {
        const info = pointerInfo;

        if (!info) return;
        if (event.pointerId !== info.pointerId) return;
        pointerInfo = undefined;

        if (info.didMove) {
          // The user dragged. chessboard2's onDrop already executed any valid
          // move (clearing selection via its setTimeout); for snapback paths
          // (drag back to source / off-board / invalid target) we cancel the
          // selection here so the dots/highlight don't linger.
          justSelectedRef.current = false;
          clearSelection();
          return;
        }
        onSquareClick(event);
      };
      const onPointerCancel = (event: PointerEvent): void => {
        if (pointerInfo?.pointerId === event.pointerId) {
          pointerInfo = undefined;
        }
      };

      // pointerdown stays on the board element (only count as a tap/click if
      // it started inside the board). pointermove + pointerup go on window
      // because chessboard2's dragged-piece overlay sits on body, so the
      // release event doesn't bubble back to .board.
      const controller = new AbortController();
      const { signal } = controller;

      boardElRef.current.addEventListener("pointerdown", onPointerDown, {
        signal,
      });
      window.addEventListener("pointermove", onPointerMove, { signal });
      window.addEventListener("pointerup", onPointerUp, { signal });
      window.addEventListener("pointercancel", onPointerCancel, { signal });

      detachClickRef.current = () => controller.abort();

      const { jsUrl, wasmUrl } = stockfishUrls();
      const worker = new Worker(`${jsUrl}#${wasmUrl}`);

      worker.addEventListener("message", onEngineMessage, { passive: true });
      workerRef.current = worker;

      worker.postMessage("uci");
      if (supportsThreadedStockfish()) {
        const threads = Math.min(
          Math.max(navigator.hardwareConcurrency - 1, 1),
          8
        );

        worker.postMessage(`setoption name Threads value ${threads}`);
      }
      worker.postMessage(
        `setoption name Skill Level value ${skillRef.current}`
      );
      worker.postMessage("isready");

      setReady(true);
      refreshStatus();

      if (!isHumanTurn()) requestEngineMove();
    };

    loadPromiseRef.current.then(() => {
      // Defer one frame so the chessboard2 stylesheet has been applied before
      // chessboard2 measures the container and lays out its inner squares.
      requestAnimationFrame(init);
    });

    return () => {
      cancelled = true;
    };
  }, [isHumanTurn, libs, onEngineMessage, refreshStatus, requestEngineMove]);

  useEffect(
    () => () => {
      stopEngine();
      detachClickRef.current?.();
      detachClickRef.current = undefined;
      workerRef.current?.terminate();
      workerRef.current = undefined;
      try {
        boardRef.current?.destroy();
      } catch {
        // chessboard2 may already be torn down
      }
      boardRef.current = undefined;
      chessRef.current = undefined;
      selectedSquareRef.current = undefined;
    },
    [stopEngine]
  );

  const onBoardResize = useCallback<ResizeObserverCallback>((entries) => {
    const rect = entries[0]?.contentRect;

    if (!rect) return;

    boardRef.current?.resize();
    // chessboard2 sets the squares-container height to its measured width;
    // measurement can lag by one frame during a window-resize storm,
    // leaving a thin gap between the last rank and the .board-frame border.
    // A second resize after the next layout pass catches up.
    requestAnimationFrame(() => boardRef.current?.resize());
  }, []);

  useResizeObserver(ready ? boardElRef.current : undefined, onBoardResize);

  useEffect(() => {
    if (ready) boardRef.current?.orientation(orientation);
  }, [orientation, ready]);

  const prevSelectedElRef = useRef<Element | undefined>(undefined);

  useEffect(() => {
    const boardEl = boardElRef.current;

    if (!boardEl) return;

    prevSelectedElRef.current?.classList.remove("square-selected");

    const next = selectedSquare
      ? (boardEl.querySelector(`[data-square-coord="${selectedSquare}"]`) ??
        undefined)
      : undefined;

    next?.classList.add("square-selected");
    prevSelectedElRef.current = next;
  }, [selectedSquare]);

  useEffect(() => {
    let cancelled = false;

    if (!ready || !url) {
      return () => {
        cancelled = true;
      };
    }

    readFile(url)
      .then((data) => {
        const apply = (): void => {
          if (cancelled) return;

          const chess = chessRef.current;
          const board = boardRef.current;

          // In strict-mode dev the dedicated cleanup effect can clear the
          // refs between mounts; wait for the second-mount init to repopulate.
          if (!chess || !board) {
            requestAnimationFrame(apply);
            return;
          }

          moveSeqRef.current += 1;
          stopEngine();

          chess.reset();

          let pgnLoaded = false;

          try {
            chess.loadPgn(firstGameOnly(data.toString()));
            pgnLoaded = true;
          } catch (error) {
            console.error("Failed to load PGN:", error);
            pgnLoaded = false;
          }

          if (pgnLoaded) {
            const moves = chess.history();

            setPgnMoves(moves);
            setPgnIndex(moves.length - 1);
            reviewRef.current = moves.length > 0;
            board.position(chess.fen(), false);
            prependFileToTitle(basename(url));
            refreshStatus();
          } else {
            setPgnMoves([]);
            setPgnIndex(-1);
            reviewRef.current = false;
            board.start(false);
            refreshStatus();
          }
        };

        apply();
      })
      .catch(() => {
        // Ignore read errors
      });

    return () => {
      cancelled = true;
    };
  }, [prependFileToTitle, readFile, ready, refreshStatus, stopEngine, url]);

  const onModeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setMode(event.target.value as GameMode);
      window.setTimeout(newGame, 0);
    },
    [newGame]
  );

  const onSideChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setPlayerSide(event.target.value as Side);
      window.setTimeout(newGame, 0);
    },
    [newGame]
  );

  const onSkillChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(event.target.value);

    setSkill(next);
    workerRef.current?.postMessage(`setoption name Skill Level value ${next}`);
  }, []);

  const onFlip = useCallback(() => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  const controlId = id.replace(/\s/g, "_");

  return (
    <StyledChess>
      {!ready && (
        <div className="loading-overlay">
          <StyledLoading />
        </div>
      )}
      <nav className="toolbar" role="presentation">
        <label htmlFor={`chess-mode-${controlId}`}>Mode</label>
        <select
          id={`chess-mode-${controlId}`}
          onChange={onModeChange}
          value={mode}
        >
          <option value="hvc">Human vs Computer</option>
          <option value="hvh">Human vs Human</option>
          <option value="cvc">Computer vs Computer</option>
        </select>
        <label htmlFor={`chess-side-${controlId}`}>Side</label>
        <select
          disabled={mode !== "hvc"}
          id={`chess-side-${controlId}`}
          onChange={onSideChange}
          value={playerSide}
        >
          <option value="w">White</option>
          <option value="b">Black</option>
        </select>
        <label htmlFor={`chess-skill-${controlId}`}>Difficulty</label>
        <select
          disabled={mode === "hvh"}
          id={`chess-skill-${controlId}`}
          onChange={onSkillChange}
          value={skill}
        >
          {SKILL_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <div className="actions">
          <button className="action-btn" onClick={newGame} type="button">
            New Game
          </button>
          <button
            className="action-btn secondary"
            onClick={onFlip}
            type="button"
          >
            Flip Board
          </button>
        </div>
      </nav>
      {/* Busy on the content only, never on an ancestor of the
          role="status" loader or its announcement may be withheld */}
      <div aria-busy={!ready || undefined} className="board-wrap">
        <div className="board-frame">
          <div ref={boardElRef} className="board" />
        </div>
      </div>
      {pgnMoves.length > 0 && (
        <div className="pgn-nav">
          <button
            aria-label="First move"
            className="pgn-btn"
            disabled={pgnIndex === -1}
            onClick={() => jumpTo(-1)}
            type="button"
          >
            ⏮
          </button>
          <button
            aria-label="Previous move"
            className="pgn-btn"
            disabled={pgnIndex === -1}
            onClick={() => jumpTo(pgnIndex - 1)}
            type="button"
          >
            ◀
          </button>
          <span className="pgn-counter">
            {pgnIndex + 1} / {pgnMoves.length}
          </span>
          <button
            aria-label="Next move"
            className="pgn-btn"
            disabled={pgnIndex === pgnMoves.length - 1}
            onClick={() => jumpTo(pgnIndex + 1)}
            type="button"
          >
            ▶
          </button>
          <button
            aria-label="Last move"
            className="pgn-btn"
            disabled={pgnIndex === pgnMoves.length - 1}
            onClick={() => jumpTo(pgnMoves.length - 1)}
            type="button"
          >
            ⏭
          </button>
        </div>
      )}
      <div
        className={clsx({
          over: status.className === "over",
          status: true,
          thinking: status.className === "thinking",
        })}
        role="status"
      >
        {status.text}
      </div>
    </StyledChess>
  );
};

export default memo(Chess);
