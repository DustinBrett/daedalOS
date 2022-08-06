/**
* @package HTML Chess
* @version 1.0 revision #8
* @author Stefano Gioffre', see README.txt
* @copyleft 2010 Stefano Gioffre'
* See COPYRIGHT.txt for copyright notices and details.
* @license GNU/GPL Version 3, see LICENSE.txt
* HTML Chess is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; version 3 of the License.
*
* http://htmlchess.sourceforge.net/
*
* The chess engine is written by Oscar Toledo (http://nanochess.110mb.com/),
* the 3D canvas pieces and the 3D canvas renderer are written by Jacob
* Seidelin (http://www.nihilogic.dk/).
*/

const BOARD_SIZE = 512;

var chess = (function() {
	// 3d
	var oSolidBoard, bUseKeyboard = false, graphicsStatus = 0,

	// 2d
	oBoardTable = null, aCoords, aFlatSquares, sLstSqColr,

	// both visualizations
	oBoardsBox, bHumanSide = true,

	// resizing vars
	nDeskWidth = BOARD_SIZE, nDeskHeight = BOARD_SIZE, nFlatBVMargin = 12, // theese values are modificable
	nFlatBoardSide = nDeskHeight - nFlatBVMargin, nPageX, nPageY, iBoardsBoxX, iBoardsBoxY, nDscrsX, nDscrsY, oFilm, nMinWidth = nMinHeight = BOARD_SIZE,

	// history motion picture
	nMotionId, bMotion = false, bBoundLock = false, nFrameRate = 1000,

	// DOM
	oPGNBtn, oMovesSelect, oInfoBox, oCtrlForm, oNtfArea = null, oNtfClsAll = null, bInfoBox = false, aCloseCalls = [], iNtfs = 0, rDeniedTagChrs = /(^\d)|\W/g, sAlgBoxEmpty = "digit your move...", bCtrlIsDown = false,

	// system
	sMovesList, sPGNHeader, flagHumanBlack, bReady = true, bAI = true, bCheck = false, bGameNotOver = true, lastStart = 0, lastEnd = 0, iHistPointr = -1, aHistory = [], kings = [0, 0], iRound = 1,
	oGameInfo = {}, oNewInfo = {}, etc = { // do not change theese values!!
		aBoard: [],
		aThreats: [],
		nPromotion: 0,
		bFlatView: false,
		bSolidView: false,
		bBlackSide: false,
		oFlatVwArea: null,
		oSolidVwArea: null,
		aPiecesLab: null,
		bKeyCtrl: true,
		i3DWidth: nDeskWidth,
		i3DHeight: nDeskHeight,
		lookAt: function(nGetPosX, nGetPosY) { return(this.aBoard[nGetPosY * 10 + nGetPosX + 21]); },
		isValidMove: function(nPosX, nPosY, nTargetX, nTargetY) {
			var startSq = nPosY * 10 + nPosX + 21, nPiece = this.aBoard[startSq];
			if (nPiece === 0) { return(true); }
			var endSq = nTargetY * 10 + nTargetX + 21, nTarget = this.aBoard[endSq], nPieceType = nPiece & 7, flagPcColor = nPiece & 8, bHasMoved = Boolean(nPiece & 16 ^ 16), flagTgColor = nTarget & 8, nWay = 4 - flagPcColor >> 2, nDiffX = nTargetX - nPosX, nDiffY = nTargetY - nPosY;
			switch (nPieceType) {
				case 1: // pawn
					if (((nDiffY | 7) - 3) >> 2 !== nWay) { return(false); }
					if (nDiffX === 0) {
						if ((nDiffY + 1 | 2) !== 2 && (nDiffY + 2 | 4) !== 4) { return(false); }
						if (nTarget > 0) { return(false); }
						if (nTargetY === nPosY + (2 * nWay)) {
							if (bHasMoved) { return(false); }
							if (this.lookAt(nTargetX, nTargetY - nWay) > 0) { return(false); }
						}
					} else if ((nDiffX + 1 | 2) === 2) {
						if (nDiffY !== nWay) { return(false); }
						if ((nTarget < 1 || flagTgColor === flagPcColor) && (/* not en passant: */ nPosY !== 7 + nWay >> 1 || /* if our pawn is not on the opening, or if it is but... */ nPawnStride % 10 - 1 !== nTargetX /* ...not near him another pawn has moved for first time. */)) { return(false); }
					} else { return(false); }
					break;
				case 3: // knight
					if (((nDiffY + 1 | 2) - 2 | (nDiffX + 2 | 4) - 2) !== 2 && ((nDiffY + 2 | 4) - 2 | (nDiffX + 1 | 2) - 2) !== 2) { return(false); }
					if (nTarget > 0 && flagTgColor === flagPcColor) { return(false); }
					break;
				case 6: // queen
					if (nTargetY !== nPosY && nTargetX !== nPosX && Math.abs(nDiffX) !== Math.abs(nDiffY)) { return(false); }
					break;
				case 5: // rook
					if (nTargetY !== nPosY && nTargetX !== nPosX) { return(false); }
					break;
				case 4: // bishop
					if (Math.abs(nDiffX) !== Math.abs(nDiffY)) { return(false); }
					break;
				case 2: // king
					var ourRook;
					if ((nDiffY === 0 || (nDiffY + 1 | 2) === 2) && (nDiffX === 0 || (nDiffX + 1 | 2) === 2)) {
						if (nTarget > 0 && flagTgColor === flagPcColor) { return(false); }
					} else if (ourRook = this.lookAt(30 - nDiffX >> 2 & 7, nTargetY), (nDiffX + 2 | 4) === 4 && nDiffY === 0 && !bCheck && !bHasMoved && ourRook > 0 && Boolean(ourRook & 16)) { // castling
						for (var passX = nDiffX * 3 + 14 >> 2; passX < nDiffX * 3 + 22 >> 2; passX++) { if (this.lookAt(passX, nTargetY) > 0 || isThreatened(passX, nTargetY, nTargetY / 7 << 3 ^ 1)) { return(false); } }
						if (nDiffX + 2 === 0 && this.aBoard[nTargetY * 10 + 22] > 0) { return(false); }
					} else { return(false); }
					break;
			}
			if (nPieceType === 5 || nPieceType === 6) {
				if (nTargetY === nPosY) {
					if (nPosX < nTargetX) {
						for (var iOrthogX = nPosX + 1; iOrthogX < nTargetX; iOrthogX++) { if (this.lookAt(iOrthogX, nTargetY) > 0) { return(false); } }
					} else {
						for (var iOrthogX = nPosX - 1; iOrthogX > nTargetX; iOrthogX--) { if (this.lookAt(iOrthogX, nTargetY) > 0) { return(false); } }
					}
				}
				if (nTargetX === nPosX) {
					if (nPosY < nTargetY) {
						for (var iOrthogY = nPosY + 1; iOrthogY < nTargetY; iOrthogY++) { if (this.lookAt(nTargetX, iOrthogY) > 0) { return(false); } }
					} else {
						for (var iOrthogY = nPosY - 1; iOrthogY > nTargetY; iOrthogY--) { if (this.lookAt(nTargetX, iOrthogY) > 0) { return(false); } }
					}
				}
				if (nTarget > 0 && flagTgColor === flagPcColor) { return(false); }
			}
			if (nPieceType === 4 || nPieceType === 6) {
				if (nTargetY > nPosY) {
					var iObliqueY = nPosY + 1;
					if (nPosX < nTargetX) {
						for (var iObliqueX = nPosX + 1; iObliqueX < nTargetX; iObliqueX++) {
							if (this.lookAt(iObliqueX, iObliqueY) > 0) { return(false); }
							iObliqueY++;
						}
					} else {
						for (var iObliqueX = nPosX - 1; iObliqueX > nTargetX; iObliqueX--) {
							if (this.lookAt(iObliqueX, iObliqueY) > 0) { return(false); }
							iObliqueY++;
						}
					}
				}
				if (nTargetY < nPosY) {
					var iObliqueY = nPosY - 1;
					if (nPosX < nTargetX) {
						for (var iObliqueX = nPosX + 1; iObliqueX < nTargetX; iObliqueX++) {
							if (this.lookAt(iObliqueX, iObliqueY) > 0) { return(false); }
							iObliqueY--;
						}
					} else {
						for (var iObliqueX = nPosX - 1; iObliqueX > nTargetX; iObliqueX--) {
							if (this.lookAt(iObliqueX, iObliqueY) > 0) { return(false); }
							iObliqueY--;
						}
					}
				}
				if (nTarget > 0 && flagTgColor === flagPcColor) { return(false); }
			}
			/* Although it might seem impossible that the target is the opponent's king, this condition is needed for certain hypothesis. */
			if (nTarget + 6 & 7) {
				var bKingInCheck = false, oKing = nPieceType === 2 ? endSq : kings[flagPcColor >> 3];
				this.aBoard[startSq] = 0;
				this.aBoard[endSq] = nPiece;
				if (isThreatened(oKing % 10 - 1, (oKing - oKing % 10) / 10 - 2, flagPcColor ^ 8)) { bKingInCheck = true; }
				this.aBoard[startSq] = nPiece;
				this.aBoard[endSq] = nTarget;
				if (bKingInCheck) { return(false); }
			}
			return(true);
		},
		makeSelection: function(nSquareId, bFromSolid) {
			if (!bReady) { return; }
			fourBtsLastPc = (etc.aBoard[nSquareId] ^ flagWhoMoved) & 15;
			if (fourBtsLastPc > 8) {
				if (etc.bSolidView) { oSolidBoard.selectPiece(nSquareId, true, bFromSolid); }
				if (etc.bFlatView) {
					if (nFrstFocus) { squareFocus(nFrstFocus, false); }
					if (!bFromSolid) { squareFocus(nSquareId, true); }
				}
				nFrstFocus = nSquareId;
			}
			else if (nFrstFocus && fourBtsLastPc < 9) {
				if (iHistPointr + 1 < aHistory.length && etc.isValidMove(nFrstFocus % 10 - 1, (nFrstFocus - nFrstFocus % 10) / 10 - 2, nSquareId % 10 - 1, (nSquareId - nSquareId % 10) / 10 - 2)) {
					if (confirm("Moving now all subsequent moves will be lost. Are you sure?")) { trimHistory(); }
					else { return; }
				}
				nScndFocus = nSquareId;
				fourBtsLastPc = etc.aBoard[nFrstFocus] & 15;
				if ((fourBtsLastPc & 7) === 1 & (nScndFocus < 29 | nScndFocus > 90)) { fourBtsLastPc = 14 - etc.nPromotion ^ flagWhoMoved; }
				consider(0, 0, 0, 21, nPawnStride, 1);
				if (etc.bSolidView) { oSolidBoard.selectPiece(nSquareId, false, bFromSolid); }
				if (etc.bFlatView) {
					squareFocus(nFrstFocus, false);
					writeFlatPieces();
				}
				if (bAI && flagWhoMoved === flagHumanBlack && fourBtsLastPc - flagHumanBlack < 9) {
					bReady = false;
					window.setTimeout(engineMove, 250);
				}
			}
		}
	};

	function newPGNHeader() {
		var sOpp = bAI ? "HTMLChess" : "?";
		for (var iOldKey in oGameInfo) { delete oGameInfo[iOldKey]; }
		oGameInfo.Event = "No name match";
		oGameInfo.Site = document.domain || "?";
		oGameInfo.Date = (new Date()).toLocaleDateString();
		oGameInfo.Round = bAI ? String(iRound++) : "1";
		if (flagHumanBlack) { oGameInfo.White = sOpp; oGameInfo.Black = "Human"; }
		else { oGameInfo.White = "Human"; oGameInfo.Black = sOpp; }
		oGameInfo.Result = "*";
		updatePGNHeader();
	}

	function isThreatened(nPieceX, nPieceY, flagFromColor) {
		var iMenacing, bIsThrtnd = false;
		for (var iMenaceY = 0; iMenaceY < 8; iMenaceY++) {
			for (var iMenaceX = 0; iMenaceX < 8; iMenaceX++) {
				iMenacing = etc.aBoard[iMenaceY * 10 + iMenaceX + 21];
				if (iMenacing > 0 && (iMenacing & 8) === flagFromColor && etc.isValidMove(iMenaceX, iMenaceY, nPieceX, nPieceY)) { bIsThrtnd = true; break; }
			}
			if (bIsThrtnd) { break; }
		}
		return(bIsThrtnd);
	}

	function getInCheckPieces() {
		var iExamX, iExamY, iExamPc, bNoMoreMoves = true, myKing = kings[flagWhoMoved >> 3 ^ 1];
		bCheck = isThreatened(myKing % 10 - 1, (myKing - myKing % 10) / 10 - 2, flagWhoMoved);
		etc.aThreats.splice(0);
		for (var iExamSq = 21; iExamSq < 99; iExamSq += iExamSq % 10 < 8 ? 1 : 3) {
			iExamX = iExamSq % 10 - 1;
			iExamY = (iExamSq - iExamSq % 10) / 10 - 2;
			iExamPc = etc.aBoard[iExamSq];
			if (bNoMoreMoves && iExamPc > 0 && (iExamPc & 8 ^ 8) === flagWhoMoved) {
				for (var iWaySq = 21; iWaySq < 99; iWaySq += iWaySq % 10 < 8 ? 1 : 3) {
					if (etc.isValidMove(iExamX, iExamY, iWaySq % 10 - 1, (iWaySq - iWaySq % 10) / 10 - 2)) { bNoMoreMoves = false; break; }
				}
			}
			if ((!bCheck || (iExamPc & 7) === 2) && iExamPc > 0 && (iExamPc & 8 ^ 8) === flagWhoMoved && isThreatened(iExamX, iExamY, flagWhoMoved)) { etc.aThreats.push(iExamSq); }
		}
		if (bNoMoreMoves) {
			if (bCheck) {
				var sWinner = flagWhoMoved ? "Black" : "White";
				oGameInfo.Result = flagWhoMoved ? "0-1" : "1-0";
				sendMsg((oGameInfo.hasOwnProperty(sWinner) ? oGameInfo[sWinner] : sWinner) + " wins.", "The king is threatened and can not move (<em>checkmate<\/em>).", 10000);
				sMovesList = sMovesList.replace(/\+$/, "#");
			} else {
				oGameInfo.Result = "1/2-1/2";
				sendMsg("Drawn game", "The opponent can not move (<em>draw<\/em>).", 10000);
			}
			bGameNotOver = false;
		} else if (oGameInfo.hasOwnProperty("Result") && oGameInfo.Result.search(/^(\d+\-\d+)$/) > -1 && iHistPointr === aHistory.length - 1) {
			var sWinner = oGameInfo.Result.valueOf() === "1-0" ? "White" : "Black";
			sendMsg((oGameInfo.hasOwnProperty(sWinner) ? oGameInfo[sWinner] : sWinner) + " wins.", "The opponent has withdrawn.", 10000);
			bGameNotOver = false;
		} else { oGameInfo.Result = "*"; bGameNotOver = true; }
	}

	function getPcByParams(nParamId, nWhere) {
		var nPieceId = aParams[nParamId];
		if ((nPieceId & 7) === 2) { kings[nParamId >> 3 & 1] = nWhere; }
		return(nPieceId);
	}

	function resetBoard() {
		var iParamId = 0;
		nFrstFocus = fourBtsLastPc = nPawnStride = lastStart = lastEnd = 0; flagWhoMoved = 8; iHistPointr = -1;
		aHistory.splice(0);
		etc.aThreats.splice(0);
		for (var iPosition = 1; iPosition < 121; iPosition++) { etc.aBoard[iPosition - 1] = iPosition % 10 ? iPosition / 10 % 10 < 2 | iPosition % 10 < 2 ? 7 : iPosition / 10 & 4 ? 0 : getPcByParams(iParamId++, iPosition - 1) | 16 : 7; }
		sMovesList = new String();
		oMovesSelect.innerHTML = "<option>Game start<\/option>";
		oMovesSelect.selectedIndex = 0;
	}

	function trimHistory() {
		sMovesList = sMovesList.substr(0, sMovesList.search(new RegExp((iHistPointr & 1 ^ 1 ? " \\w+(\\=\\w+)?" : "¶" + String(iHistPointr + 4 >> 1) + "\\.\\s.*") + (iHistPointr === aHistory.length - 2 ? "$" : ""))));
		aHistory.splice(iHistPointr + 1);
		oGameInfo.Result = "*";
	}

	/*
	* signedNumber is a 29 bits number.
	* 		01010			01010			01010			0101010			0101010
	*		promotion (5 bits)	target (5 bits)		piece (5 bits)		end point (7 bits)	start point (7 bits)
	*		[bits 25 to 29]		[bits 20 to 24]		[bits 15 to 19]		[bits 8 to 14]		[bits 1 to 7]
	*/
	function writeHistory(bGraphRendrng, nStartPt, nEndPt, nPieceId, nTarget, nPromo) {
		var nMoves = aHistory.length >> 1, sPromoAlg = new String(), nEndPosX = nEndPt % 10 - 1, nEndPosY = (nEndPt - nEndPt % 10) / 10 - 2, nStartPosX = nStartPt % 10 - 1, nStartPosY = (nStartPt - nStartPt % 10) / 10 - 2, iVerifyX, iVerifyY, disambiguateX = false, disambiguateY = false, signedNumber = nStartPt | nEndPt << 7 | nPieceId << 14 | nTarget << 19, vPromo = false, bWriteCapture = ((nPieceId & 7) === 1 && (nStartPt + nEndPt & 1) && nTarget === 0 /* en passant */) || nTarget > 0, colorFlag = nPieceId & 8;
		lastStart = nStartPt;
		lastEnd = nEndPt;
		if ((nEndPosY + 1 | 9) === 9 /* true in case of nEndPosY === -1! */ && (nPieceId & 7) === 1) {
			vPromo = nPromo || (22 - etc.nPromotion ^ colorFlag);
			signedNumber |= vPromo << 24;
			sPromoAlg = "=" + "NBRQ".charAt(vPromo - 3 & 7);
		}
		aHistory.push(signedNumber);
		if ((nPieceId & 7) === 2) { kings[colorFlag >> 3] = nEndPt; }
		for (var iVerifySq = 21; iVerifySq < 99; iVerifySq += iVerifySq % 10 < 8 ? 1 : 3) {
			var iVerifyPc = etc.aBoard[iVerifySq];
			if ((iVerifyPc & 15) === (nPieceId & 15) && iVerifySq !== nEndPt) {
				etc.aBoard[nEndPt] = 0;
				iVerifyX = iVerifySq % 10 - 1;
				iVerifyY = (iVerifySq - iVerifySq % 10) / 10 - 2;
				if (etc.isValidMove(iVerifyX, iVerifyY, nEndPosX, nEndPosY)) {
					if (iVerifyX === nStartPosX) { disambiguateY = true; }
					else if (iVerifyY === nStartPosY) { disambiguateX = true; }
					else { disambiguateX = true; }
				}
				etc.aBoard[nEndPt] = vPromo || nPieceId & 15;
			}
		}
		sMovesList += (colorFlag ? " " : (nMoves ? "¶" : "") + String(nMoves + 1) + ". ");
		if ((nPieceId & 7) === 2 && (nEndPt - nStartPt + 2 | 4) === 4) { sMovesList += "O-O" + (nStartPt - nEndPt === 2 ? "-O" : ""); }
		else { sMovesList += ((nPieceId & 7) !== 1 ? "KNBRQ".charAt(nPieceId - 2 & 7) : "") + (((nPieceId & 7) === 1 && bWriteCapture) || disambiguateX ? String.fromCharCode(96 + nStartPt % 10) : "") + (disambiguateY ? String(nStartPosY + 1) : "") + (bWriteCapture ? "x" : "") + String.fromCharCode(96 + nEndPt % 10) + String(nEndPosY + 1) + sPromoAlg + (bCheck ? "+" : ""); }

		oMovesSelect.innerHTML = "<option>Game start<\/option><option>" + sMovesList.replace(/¶/g,"<\/option><option>") + "<\/option>";
		oMovesSelect.selectedIndex = oMovesSelect.length - 1;
		updatePGNLink();
		if (bGraphRendrng) {
			getInCheckPieces();
			if (etc.bSolidView) { oSolidBoard.move(false, nStartPt, nEndPt, nTarget, vPromo); }
		}
		iHistPointr++;
	}

	// Toledo Chess Engine (see http://nanochess.110mb.com/)
	var fourBtsLastPc, flagWhoMoved, nPawnStride, nFrstFocus, nScndFocus, nPlyDepth = 2, iSquare = 120, thnkU = [53,47,61,51,47,47], aParams = [5,3,4,6,2,4,3,5,1,1,1,1,1,1,1,1,9,9,9,9,9,9,9,9,13,11,12,14,10,12,11,13,0,99,0,306,297,495,846,-1,0,1,2,2,1,0,-1,-1,1,-10,10,-11,-9,9,11,10,20,-9,-11,-10,-20,-21,-19,-12,-8,8,12,19,21];
	function consider(thnkA, thnkB, thnkH, thnkF, thnkPawnStride, thnkDepth) {
		var iThnkPiece, thnkSigndPiece, thnkPiece, thnkL, thnkE, thnkD, thnkStartPt = thnkF, thnkN = -1e8, thnkK = 78 - thnkH << 10, thnkEndPt, thnkG, thnkM, thnkY, thnkQ, thnkTarget, thnkC, thnkJ, thnkZ = flagWhoMoved ? -10 : 10;
		flagWhoMoved ^= 8;
		iSquare++;
		thnkD = thnkA || thnkDepth && thnkDepth >= thnkH && consider(0,0,0,21,0,0) > 1e4;
		do {
			if (thnkSigndPiece = etc.aBoard[thnkEndPt = thnkStartPt]) {
				thnkQ = thnkSigndPiece & 15 ^ flagWhoMoved;
				if (thnkQ < 7) {
					thnkY = thnkQ-- & 2 ? 8 : 4;
					thnkC = thnkSigndPiece - 9 & 15 ? thnkU[thnkQ] : 57;
					do {
						thnkTarget = etc.aBoard[thnkEndPt += aParams[thnkC]];
						if (!thnkA | thnkEndPt === thnkA) {
							thnkG = thnkQ | thnkEndPt + thnkZ - thnkPawnStride ? 0 : thnkPawnStride;
							if (!thnkTarget & (!!thnkQ | thnkY < 3 || !!thnkG) || (thnkTarget + 1 & 15 ^ flagWhoMoved) > 9 && thnkQ | thnkY > 2) {
								if (thnkM = !(thnkTarget - 2 & 7)) {
									flagWhoMoved ^= 8;
									etc.aBoard[iSquare--] = thnkStartPt;
									return(thnkK);
								}
								thnkJ = iThnkPiece = thnkSigndPiece & 15;
								thnkE = etc.aBoard[thnkEndPt - thnkZ] & 15;
								thnkPiece = thnkQ | thnkE - 7 ? iThnkPiece : (iThnkPiece += 2, 6 ^ flagWhoMoved);
								while (iThnkPiece <= thnkPiece) {
									thnkL = thnkTarget ? aParams[thnkTarget & 7 | 32] - thnkH - thnkQ : 0;
									if (thnkDepth) { thnkL += (1 - thnkQ ? aParams[(thnkEndPt - thnkEndPt % 10) / 10 + 37] - aParams[(thnkStartPt - thnkStartPt % 10) / 10 + 37] + aParams[thnkEndPt % 10 + 38] * (thnkQ ? 1 : 2) - aParams[thnkStartPt % 10 + 38] + (thnkSigndPiece & 16) / 2 : !!thnkM * 9) + (!thnkQ ? !(etc.aBoard[thnkEndPt - 1] ^ iThnkPiece) + !(etc.aBoard[thnkEndPt + 1] ^ iThnkPiece) + aParams[iThnkPiece & 7 | 32] - 99 + !!thnkG * 99 + (thnkY < 2) : 0) + !(thnkE ^ flagWhoMoved ^ 9); }
									if (thnkDepth > thnkH || 1 < thnkDepth & thnkDepth === thnkH && thnkL > 15 | thnkD) {
										etc.aBoard[thnkEndPt] = iThnkPiece, etc.aBoard[thnkStartPt] = thnkM ? (etc.aBoard[thnkG] = etc.aBoard[thnkM], etc.aBoard[thnkM] = 0) : thnkG ? etc.aBoard[thnkG] = 0 : 0;
										thnkL -= consider(thnkDepth > thnkH | thnkD ? 0 : thnkEndPt, thnkL - thnkN, thnkH + 1, etc.aBoard[iSquare + 1], thnkJ = thnkQ | thnkY > 1 ? 0 : thnkEndPt, thnkDepth);
										if (!(thnkH || thnkDepth - 1 | nFrstFocus - thnkStartPt | fourBtsLastPc - iThnkPiece | thnkEndPt - nScndFocus | thnkL < -1e4)) {
											iSquare--;
											writeHistory(true, thnkStartPt, thnkEndPt, thnkSigndPiece, thnkTarget);
											return(nPawnStride = thnkJ);
										}
										thnkJ = thnkQ - 1 | thnkY < 7 || thnkM || !thnkDepth | thnkD | thnkTarget | thnkSigndPiece < 15 || consider(0,0,0,21,0,0) > 1e4;
										etc.aBoard[thnkStartPt] = thnkSigndPiece;
										etc.aBoard[thnkEndPt] = thnkTarget;
										thnkM ? (etc.aBoard[thnkM] = etc.aBoard[thnkG], etc.aBoard[thnkG] = 0) : thnkG ? etc.aBoard[thnkG] = 9 ^ flagWhoMoved : 0;
									}
									if (thnkL > thnkN || thnkDepth > 1 && thnkL == thnkN && !thnkH && Math.random() < 0.5) {
										etc.aBoard[iSquare] = thnkStartPt;
										if (thnkDepth > 1) {
											if (thnkH && thnkB - thnkL < 0) {
												flagWhoMoved ^= 8; iSquare--;
												return(thnkL);
											}
											if (!thnkH) { fourBtsLastPc = iThnkPiece, nFrstFocus = thnkStartPt, nScndFocus = thnkEndPt; }
										}
										thnkN = thnkL;
									}
									iThnkPiece += thnkJ || (thnkG = thnkEndPt, thnkM = thnkEndPt < thnkStartPt ? thnkG - 3 : thnkG + 2, etc.aBoard[thnkM] < 15 | etc.aBoard[thnkM + thnkStartPt - thnkEndPt] || etc.aBoard[thnkEndPt += thnkEndPt - thnkStartPt]) ? 1 : 0;
								}
							}
						}
					} while (!thnkTarget & thnkQ > 2 || (thnkEndPt = thnkStartPt, thnkQ | thnkY > 2 | thnkSigndPiece > 15 & !thnkTarget && thnkC++ * --thnkY));
				}
			}
		}
		while (thnkStartPt++ > 98 ? thnkStartPt = 20 : thnkF - thnkStartPt);
		flagWhoMoved ^= 8;
		iSquare--;
		return(thnkN + 1e8 && thnkN >- thnkK + 1924 | thnkD ? thnkN : 0);
	}
	// End Toledo Chess Engine

	function engineMove() {
		consider(0,0,0,21,nPawnStride,nPlyDepth);
		consider(0,0,0,21,nPawnStride,1);
		if (etc.bFlatView) { writeFlatPieces(); }
		bReady = true;
	}

	// Flat chessboard functions
	function writeFlatPieces() {
		var sSqrContent, oSquareCell, nSquareId, nMenacedSq, nConst;
		for (var iCell = 0; iCell < 64; iCell++) {
			nSquareId = (iCell >> 3) * 10 - (iCell & 7) + 28;
			oSquareCell = aFlatSquares[etc.bBlackSide ? iCell : 63 - iCell];
			sSqrContent = etc.aBoard[nSquareId]; oSquareCell.innerHTML = sSqrContent === 0 ? "" : "<span>&#98" + "171216151413231822212019".substr((((sSqrContent & 15) * 3 + (sSqrContent & 7)) >> 1) - 2, 2) + ";<\/span>";
			if (nSquareId === lastStart || nSquareId === lastEnd) { oSquareCell.style.backgroundColor = (nSquareId * 11 - nSquareId % 10) / 10 & 1 ? "#c0a1a1" : "#e8c9c9"; } else { oSquareCell.style.backgroundColor = ""; }
		}
		if (!bAI || flagHumanBlack !== flagWhoMoved) {
			for (var iThreat = 0; iThreat < etc.aThreats.length; iThreat++) {
				nMenacedSq = etc.aThreats[iThreat];
				nConst = (nMenacedSq * 4 - (nMenacedSq % 10) * 9) / 5;
				aFlatSquares[etc.bBlackSide ? nConst - 8 : 71 - nConst].style.backgroundColor = (nMenacedSq * 11 - nMenacedSq % 10) / 10 & 1 ? "#adafce" : "#dadcfb";
			}
		}
		nFrstFocus = 0;
	}

	function squareFocus(nPieceId, bMakeActive) {
		var oSelCell = aFlatSquares[etc.bBlackSide ? ((nPieceId - nPieceId % 10) / 10 - 1 << 3) - nPieceId % 10 : (9 - (nPieceId - nPieceId % 10) / 10 << 3) - 1 + nPieceId % 10];
		if (bMakeActive) { sLstSqColr = oSelCell.style.backgroundColor; }
		oSelCell.style.backgroundColor = bMakeActive ? "#4cff4c" : sLstSqColr;
	}

	function createFlatCoord(nNewHeaderId, bVertOri) {
		var oNewCoord = document.createElement("th");
		oNewCoord.className = bVertOri ? "vertCoords" : "horizCoords";
		oNewCoord.innerHTML = bVertOri ? nNewHeaderId : String.fromCharCode(97 + nNewHeaderId);
		return(oNewCoord);
	}

	function updateFlatCoords() {
		for (var iCoord = 0; iCoord < 8; iCoord++) {
			aCoords[iCoord].innerHTML = aCoords[iCoord | 16].innerHTML = String.fromCharCode(etc.bBlackSide ? 104 - iCoord : 97 + iCoord);
			aCoords[iCoord | 8].innerHTML = aCoords[iCoord | 24].innerHTML = String(etc.bBlackSide ? iCoord + 1: 8 - iCoord);
		}
	}

	function showFlatBoard() {
		if (oBoardTable) {
		// flat chessboard will be updated
			updateFlatCoords();
			if (!etc.bFlatView) {
				etc.oFlatVwArea.appendChild(oBoardTable);
				etc.bFlatView = true;
			}
		} else {
		// flat chessboard will be created
			aCoords = [], aFlatSquares = [], oBoardTable = document.createElement("table");
			var iGridRow, iFlatSquare, iHorHeadr, iVerHeadr, newSquareId, newSquareCell, gridBody = document.createElement("tbody"), gridAngle = document.createElement("td");

			iGridRow = document.createElement("tr");
			gridAngle.className = "boardAngle";
			iGridRow.appendChild(gridAngle);

			for (var iNewCoordX = 0; iNewCoordX < 8; iNewCoordX++) {
				iHorHeadr = createFlatCoord(etc.bBlackSide ? 7 - iNewCoordX : iNewCoordX, false);
				aCoords.push(iHorHeadr);
				iGridRow.appendChild(iHorHeadr);
			}
			iGridRow.appendChild(gridAngle.cloneNode(false));
			gridBody.appendChild(iGridRow);
			for (var iNewCoordY = 0; iNewCoordY < 8; iNewCoordY++) {
				iGridRow = document.createElement("tr");
				iVerHeadr = createFlatCoord(etc.bBlackSide ? iNewCoordY + 1: 8 - iNewCoordY, true);
				aCoords[iNewCoordY | 8] = iVerHeadr;
				iGridRow.appendChild(iVerHeadr);
				for (var iNewRowX = 0; iNewRowX < 8; iNewRowX++) {
					newSquareId = 91 - iNewCoordY * 10 + iNewRowX;
					newSquareCell = document.createElement("td");
					newSquareCell.className = (newSquareId + (newSquareId - newSquareId % 10) / 10) & 1 ? "blackSquares" : "whiteSquares";
					newSquareCell.id = "flatSq" + newSquareId;
					newSquareCell.onclick = getSqFnc;
					aFlatSquares.push(newSquareCell);
					iGridRow.appendChild(newSquareCell);
				}
				iVerHeadr = createFlatCoord(etc.bBlackSide ? iNewCoordY + 1: 8 - iNewCoordY, true);
				aCoords[iNewCoordY | 24] = iVerHeadr;
				iGridRow.appendChild(iVerHeadr);
				gridBody.appendChild(iGridRow);
			}
			iGridRow = document.createElement("tr");
			iGridRow.appendChild(gridAngle.cloneNode(false));
			for (var iNewCoordX = 0; iNewCoordX < 8; iNewCoordX++) {
				iHorHeadr = createFlatCoord(etc.bBlackSide ? 7 - iNewCoordX : iNewCoordX, false);
				aCoords[iNewCoordX | 16] = iHorHeadr;
				iGridRow.appendChild(iHorHeadr);
			}

			iGridRow.appendChild(gridAngle.cloneNode(false));
			gridBody.appendChild(iGridRow);
			oBoardTable.appendChild(gridBody);

			oBoardTable.id = "flatChessboard";
			oBoardTable.style.width = String(nFlatBoardSide) + "px";
			oBoardTable.style.height = String(nFlatBoardSide) + "px";
			etc.oFlatVwArea.appendChild(oBoardTable);
			etc.bFlatView = true;
		}
		writeFlatPieces();
	}

	// Solid chessboard functions
	function runComponents() {
		graphicsStatus++;
		if (graphicsStatus === 15) {
			try {
				etc.aPiecesLab = (new Function("return [function() {" + etc.aFncBodies.slice(0, 6).join("}, function() {") + "}];"))();
				(new Function(etc.aFncBodies.slice(6, 12).join("\n")))();
				updateViewSize(true, false);
				oSolidBoard = (new Function(etc.aFncBodies[12])).call(etc);
			} catch (oErr2) { alert("Sorry, but your browser does not support 3D canvas."); }
			etc.aFncBodies.splice(0);
			document.body.removeChild(etc.oCurtain);
			delete etc.aFncBodies;
			delete etc.oCurtain;
			oBoardsBox.style.width = nDeskWidth + "px";
		}
	}

	function loadCom(nIndex) {
		if (graphicsStatus === 0) { return; }
		etc.aFncBodies[nIndex] = this.responseText;
		runComponents();
	}

	function showSolidBoard() {
		if (graphicsStatus === 0) {
			graphicsStatus = 1;
			etc.oCurtain = document.createElement("div");
			etc.oCurtain.id = "chessCurtain";
			etc.oCurtain.innerHTML = "<div id=\"chessLoading\">Loading&hellip;<\/div>";
			document.body.appendChild(etc.oCurtain);
			etc.aFncBodies = [null, null, null, null, null, null, null, null, null, null, null, null, null];
			XHR("meshes/board.json", function() {
				if (graphicsStatus === 0) { return; }
				etc.tmp3DBoard = eval("(" + this.responseText + ")");
				runComponents();
			});
			XHR("meshes/pawn.jscn", loadCom, 0);
			XHR("meshes/king.jscn", loadCom, 1);
			XHR("meshes/knight.jscn", loadCom, 2);
			XHR("meshes/bishop.jscn", loadCom, 3);
			XHR("meshes/rook.jscn", loadCom, 4);
			XHR("meshes/queen.jscn", loadCom, 5);
			XHR("canvas3dengine/scene.jsfb", loadCom, 6);
			XHR("canvas3dengine/vec3.jsfb", loadCom, 7);
			XHR("canvas3dengine/matrix3.jsfb", loadCom, 8);
			XHR("canvas3dengine/camera.jsfb", loadCom, 9);
			XHR("canvas3dengine/mesh.jsfb", loadCom, 10);
			XHR("canvas3dengine/light.jsfb", loadCom, 11);
			XHR("solidView.jsfb", loadCom, 12);
		} else {
			updateViewSize(true, true);
			oSolidBoard.show();
		}
	}

	function updatePGNHeader() {
		sPGNHeader = new String();
		for (var iHeadKey in oGameInfo) { sPGNHeader += "[" + iHeadKey + " \"" + oGameInfo[iHeadKey] + "\"]\n"; }
	}

	function updatePGNLink() { oPGNBtn.setAttribute("href", "data:application/x-chess-pgn;US-ASCII," + escape(sPGNHeader + "\n" + sMovesList.replace(/¶/g," ") + (aHistory.length > 0 ? " " : "") + oGameInfo.Result)); }

	function runAlgebraic(sAlgMove, nColorFlag, bGraphRendrng) {
		try {
			var nAlgStartSq = 0, nAlgEndSq, nAlgPromo, nAlgPiece, nAlgTarget;
			if (sAlgMove === "O-O" || sAlgMove === "O-O-O") {
				nCastlType = sAlgMove === "O-O" ? 1 : -1;
				nAlgStartSq = kings[nColorFlag >> 3];
				nAlgPromo = nColorFlag + 2;
				nAlgPiece = nAlgPromo | 16;
				nAlgTarget = 0;
				nAlgEndSq = nAlgStartSq + nCastlType * 2;
				etc.aBoard[nAlgStartSq + 3 + (nCastlType - 1) * 7 / 2] = 0;
				etc.aBoard[nAlgStartSq + nCastlType] = nColorFlag + 5;
				kings[nColorFlag >> 3] = nAlgEndSq;
			} else {
				var nAlgPcType, nAlgStartX = nAlgStartY = 8, rPromo = /(\=.+)/, nAlgPcIndex = sAlgMove.replace(rPromo, "").search(/[A-Z]/), aYCoords = sAlgMove.match(/\d/g), aXCoords = sAlgMove.replace(/x/g, "").match(/[a-z]/g), nAlgEndX = aXCoords[aXCoords.length - 1].charCodeAt(0) - 97, nAlgEndY = aYCoords[aYCoords.length - 1] - 1;
				if (aXCoords.length > 1) { nAlgStartX = aXCoords[0].charCodeAt(0) - 97; }
				if (aYCoords.length > 1) { nAlgStartY = aYCoords[0] - 1; }
				if (nAlgPcIndex > -1) { nAlgPcType = "PKNBRQ".indexOf(sAlgMove.substr(nAlgPcIndex, 1)) + 1; } else { nAlgPcType = 1; }
				var nAlg4btsPiece = nAlgPcType | nColorFlag, nAlgPromoIndex = sAlgMove.search(rPromo);
				nAlgEndSq = nAlgEndY * 10 + nAlgEndX + 21;
				if (nAlgStartX < 8) {
					if (nAlgStartY < 8) {
						if (etc.lookAt(nAlgStartX, nAlgStartY) && etc.isValidMove(nAlgStartX, nAlgStartY, nAlgEndX, nAlgEndY)) {
							nAlgStartSq = nAlgStartY * 10 + nAlgStartX + 21;
							nAlgPiece = etc.aBoard[nAlgStartSq];
						}
						else { return(false); } // piece not found!!!
					} else {
						for (var iFoundY = 0; iFoundY < 8; iFoundY++) {
							iFoundPc = etc.lookAt(nAlgStartX, iFoundY);
							if ((iFoundPc & 15) === nAlg4btsPiece && etc.isValidMove(nAlgStartX, iFoundY, nAlgEndX, nAlgEndY)) {
								nAlgStartY = iFoundY;
								nAlgStartSq = iFoundY * 10 + nAlgStartX + 21;
								nAlgPiece = iFoundPc;
								break;
							}
						}
					}
				} else {
					if (nAlgStartY < 8) {
						for (var iFoundX = 0; iFoundX < 8; iFoundX++) {
							iFoundPc = etc.aBoard[nAlgStartY * 10 + iFoundX + 21];
							if ((iFoundPc & 15) === nAlg4btsPiece && etc.isValidMove(iFoundX, nAlgStartY, nAlgEndX, nAlgEndY)) {
								nAlgStartX = iFoundX;
								nAlgStartSq = nAlgStartY * 10 + iFoundX + 21;
								nAlgPiece = iFoundPc;
								break;
							}

						}
					} else {
						for (var iFoundSq = 21; iFoundSq < 99; iFoundSq += iFoundSq % 10 < 8 ? 1 : 3) {
							iFoundPc = etc.aBoard[iFoundSq];
							if ((iFoundPc & 15) === nAlg4btsPiece && etc.isValidMove(iFoundSq % 10 - 1, (iFoundSq - iFoundSq % 10) / 10 - 2, nAlgEndX, nAlgEndY)) {
								nAlgStartX = iFoundSq % 10 - 1;
								nAlgStartY = (iFoundSq - iFoundSq % 10) / 10 - 2;
								nAlgStartSq = iFoundSq;
								nAlgPiece = iFoundPc;
								break;
							}
						}
					}
				}
				if ((nAlgPiece & 7) === 1 && (nAlgEndY + 1 | 9) === 9) {
					if (nAlgPromoIndex === -1) { nAlgPromo = 22 - etc.nPromotion ^ nColorFlag; }
					else { nAlgPromo = "KNBRQ".indexOf(sAlgMove.substr(nAlgPromoIndex + 1, 1)) + nColorFlag + 18; }
				}
				else { nAlgPromo = nAlgPiece; }
				nAlgTarget = etc.aBoard[nAlgEndSq];
			}
			if (nAlgStartSq === 0) { return(false); } // piece not found!!!
			var hisKing = kings[nColorFlag >> 3 ^ 1];
			if ((nAlgPiece & 7) === 1 && (nAlgStartSq + nAlgEndSq & 1) && nAlgTarget === 0) { etc.aBoard[nAlgStartSq - nAlgStartSq % 10 + nAlgEndSq % 10] = 0; } // en passant
			etc.aBoard[nAlgStartSq] = 0;
			etc.aBoard[nAlgEndSq] = nAlgPromo;
			if ((nAlgPiece & 7) === 2) { kings[nColorFlag >> 3] = nAlgEndSq; }
			bCheck = isThreatened(hisKing % 10 - 1, (hisKing - hisKing % 10) / 10 - 2, nColorFlag);
			nFrstFocus = nAlgStartSq;
			nScndFocus = nAlgEndSq;
			nPawnStride = (nAlgPiece & 7) === 1 && (nAlgStartY - nAlgEndY + 2 | 4) === 4 ? nAlgEndSq : 0;
			fourBtsLastPc = nAlgPiece & 15;
			writeHistory(bGraphRendrng, nAlgStartSq, nAlgEndSq, nAlgPiece, nAlgTarget, nAlgPromo);
			return(true);
		}
		catch (oErr1) { return(false); }
	}

	function readHistory(nRelPt, bSynchrList) {
		var iSigned, nExprs1, nExprs2, iHistPiece, iHistTarg, iHistPromo, bitBackward = 0, nMvsDiff = Math.abs(nRelPt), iHistPts = [null, null];
		if (nRelPt < 0) { bitBackward = 1; }
		nFrstFocus = nScndFocus = 0;
		flagWhoMoved ^= nMvsDiff << 3 & 8;
		for (var iNav = 0; iNav < nMvsDiff; iNav++) {
			iSigned = aHistory[iHistPointr + 1 - bitBackward];
			iHistPts[0] = iSigned & 127;
			iHistPts[1] = iSigned >> 7 & 127;
			iHistPiece = iSigned >> 14;
			iHistTarg = iSigned >> 19 & 31;
			iHistPromo = iHistPiece > 1023 ? (bitBackward ? 9 - (iHistPts[1] - iHistPts[1] % 10 & 8) : iSigned >> 24) : false;
			if ((iHistPiece & 7) === 2) {
				if ((iHistPts[1] - iHistPts[0] + 2 | 4) === 4) { // castling
					nExprs1 = iHistPts[1] - iHistPts[1] % 10 + (iHistPts[1] - iHistPts[0] > 0 ? 8 : 1);
					nExprs2 = iHistPts[1] - iHistPts[1] % 10 + (iHistPts[1] - iHistPts[0] > 0 ? 6 : 4);
					etc.aBoard[bitBackward ? nExprs1 : nExprs2] = 5 + (iHistPts[1] - iHistPts[1] % 10 & 8) + (bitBackward << 4);
					etc.aBoard[bitBackward ? nExprs2 : nExprs1] = 0;
				}
				kings[iHistPointr + 1 + bitBackward & 1] = iHistPts[bitBackward ^ 1];
			}
			etc.aBoard[iHistPts[bitBackward ^ 1]] = iHistPromo || (iHistPiece & (15 + (bitBackward << 4)));
			etc.aBoard[iHistPts[bitBackward]] = bitBackward === 1 ? iHistTarg : 0;
			if ((iHistPiece & 7) === 1 && (iHistPts[1] - iHistPts[0] & 1) && iHistTarg === 0) { etc.aBoard[iHistPts[0] - iHistPts[0] % 10 + iHistPts[1] % 10] = bitBackward ? 1 | (iHistPiece & 8 ^ 8) : 0; } // en passant
			iHistPointr += 1 - (bitBackward << 1);
			if (iNav === nMvsDiff - 1) { getInCheckPieces(); }
			if (etc.bSolidView) { oSolidBoard.move(bitBackward, iHistPts[0], iHistPts[1], iHistTarg, iHistPromo); }

		}
		if (iHistPointr === -1) {
			fourBtsLastPc = nPawnStride = lastStart = lastEnd = 0;
		} else {
			if (bitBackward) {
				iSigned = aHistory[iHistPointr];
				iHistPts[0] = iSigned & 127;
				iHistPts[1] = iSigned >> 7 & 127;
				iHistPiece = iSigned >> 14;
			}
			nPawnStride = (iHistPiece & 7) === 1 && ((iHistPts[0] - iHistPts[1] - iHistPts[0] % 10 + iHistPts[1] % 10) / 10 + 2 | 4) === 4 ? iHistPts[1] : 0;
			lastStart = iHistPts[0];
			lastEnd = iHistPts[1];
			fourBtsLastPc = iHistPiece & 15;
		}
		if (etc.bFlatView) { writeFlatPieces(); }
		if (bSynchrList) { oMovesSelect.selectedIndex = iHistPointr + 2 >> 1; }
	}

	function histClearIter() {
		if (!bMotion) { return; }
		window.clearInterval(nMotionId);
		oMovesSelect.disabled = bMotion = false;
		if (bBoundLock) { bReady = true; }
	}

	function sendAlgebraic(sMove) {
		if (!bReady) { return(false); }
		if (iHistPointr + 1 < aHistory.length) {
			if (confirm("Moving now all subsequent moves will be lost. Do you want try to move?")) { trimHistory(); } else { return(false); }
		}
		if (!runAlgebraic(sMove, flagWhoMoved ^ 8, true)) { return(false); }
		if ((fourBtsLastPc & 7) === 1 & (nScndFocus < 29 | nScndFocus > 90)) { fourBtsLastPc = 14 - etc.nPromotion ^ flagWhoMoved; }
		flagWhoMoved ^= 8;
		if (etc.bFlatView) { writeFlatPieces(); }
		if (bAI && flagWhoMoved === flagHumanBlack) { bReady = false; window.setTimeout(engineMove, 250); }
		return(true);
	}

// DOM private APIs
	function closeMsg(oMsgNode, nEventId) {
		var iFrameA1 = 1;
		for (var iFrameA2 = 1; iFrameA2 < 5; iFrameA2++) { window.setTimeout(function() { oMsgNode.style.opacity = "0." + String(85 - (17 * iFrameA1)); iFrameA1++; }, iFrameA2 * 50); }
		window.setTimeout(function() { oMsgNode.style.opacity = "0"; oNtfArea.removeChild(oMsgNode); iNtfs--; if (iNtfs === 1) { oNtfClsAll.style.display = "none"; } if (iNtfs === 0) { document.body.removeChild(oNtfArea); oNtfArea = null; oNtfClsAll = null; aCloseCalls = []; } }, 250);
		aCloseCalls[nEventId] = false;
	}

	function sendMsg(sMsgTitle, sMsgTxt, nDuration) {
		var oNewMsg = document.createElement("div"), oMsgClose = document.createElement("div"), oMsgTitle = document.createElement("div"), oMsgBody = document.createElement("div"), iFrameB1 = 1, nEventId = aCloseCalls.length;
		if (oNtfArea === null) {
			oNtfClsAll = document.createElement("div");
			oNtfArea = document.createElement("div");
			setAttribs.call(oNtfArea, ["className", "top-right gnotify"], ["id", "gnotify"]);
			setAttribs.call(oNtfClsAll, ["className", "gnotify-closer"], ["innerHTML", "[ close all ]"], ["onclick", function() {
				var iFrameC1 = 1;
				for (var iEventId = 0; iEventId < aCloseCalls.length; iEventId++) { if (aCloseCalls[iEventId] !== false) { window.clearTimeout(aCloseCalls[iEventId]); } }
				for (var iFrameC2 = 1; iFrameC2 < 5; iFrameC2++) {
					window.setTimeout(function() { oNtfArea.style.opacity = "0." + String(85 - (17 * iFrameC1)); iFrameC1++; }, iFrameC2 * 50);

				}
				window.setTimeout(function() { oNtfArea.style.opacity = "0"; document.body.removeChild(oNtfArea); oNtfArea = null; oNtfClsAll = null; iNtfs = 0; aCloseCalls = new Array(); }, 250);
			}]);
			document.body.appendChild(oNtfArea);
			oNtfArea.appendChild(oNtfClsAll);
		}
		if (iNtfs > 0) { oNtfClsAll.style.display = "block"; }
		for (var iFrameB2 = 1; iFrameB2 < 6; iFrameB2++) { window.setTimeout(function() { oNewMsg.style.opacity = "0." + String(17 * iFrameB1); iFrameB1++; }, iFrameB2*50); }
		aCloseCalls.push(window.setTimeout(function() { closeMsg(oNewMsg, nEventId); oNewMsg = null; }, nDuration));
		oNewMsg.className = "gnotify-notification default";
		setAttribs.call(oMsgClose, ["className", "close"], ["onclick", function() { if (aCloseCalls[nEventId] !== false) { window.clearTimeout(aCloseCalls[nEventId]); closeMsg(oNewMsg,nEventId); } }], ["innerHTML", "&times;"]);
		setAttribs.call(oMsgTitle, ["className", "header"], ["innerHTML", sMsgTitle]);
		setAttribs.call(oMsgBody, ["className", "gnotify-message"], ["innerHTML", sMsgTxt]);
		oNewMsg.appendChild(oMsgClose);
		oNewMsg.appendChild(oMsgTitle);
		oNewMsg.appendChild(oMsgBody);
		setStyles.call(oNewMsg, ["display", "block"], ["opacity", "0"]);
		oNtfArea.insertBefore(oNewMsg,oNtfClsAll);
		iNtfs++;
	}

	function returnFalse() { return(false); }

	function getSqFnc() {
		var getId = parseFloat(this.id.substr(this.id.search(/\d+/)));
		etc.makeSelection(etc.bBlackSide ? 119 - getId : getId, false);
	}

	function synchrMovesList() {
		var nRelMoves = (this.selectedIndex << 1) - iHistPointr - (this.selectedIndex > 0 && flagHumanBlack ? 2 : 1);
		if (bMotion || nRelMoves === 0) { return; }
		readHistory(nRelMoves, false);
	}

	function resizeFilm(oMsEvnt2) {
		if (!oMsEvnt2) { oMsEvnt2 = window.event; }
		var iMsWidth = oMsEvnt2.clientX + nPageX + nDscrsX - iBoardsBoxX, iMsHeight = oMsEvnt2.clientY + nPageY + nDscrsY - iBoardsBoxY;
		nDeskWidth = iMsWidth < nMinWidth ? nMinWidth : nDeskWidth = iMsWidth - 1 | 1;
		nDeskHeight = iMsHeight < nMinHeight ? nMinHeight : iMsHeight - 1 | 1;
		oFilm.style.width = nDeskWidth + "px";
		oFilm.style.height = nDeskHeight + "px";
	}

	function updateViewSize(bCrushFlatWidth, bResizeSolidB) {
		var eachViewWidth = bCrushFlatWidth ? nDeskWidth / 2 : nDeskWidth;
		nFlatBoardSide = (eachViewWidth < nDeskHeight ? eachViewWidth : nDeskHeight) - nFlatBVMargin;
		etc.i3DWidth = etc.bFlatView ? nDeskWidth / 2 : nDeskWidth;
		if (etc.bFlatView) {
			etc.oFlatVwArea.style.width = eachViewWidth + "px";
			etc.oFlatVwArea.style.height = nDeskHeight + "px";
			oBoardTable.style.marginTop = oBoardTable.style.marginBottom = String((nDeskHeight - nFlatBoardSide) / 2) + "px";
			oBoardTable.style.width = nFlatBoardSide + "px";
			oBoardTable.style.height = nFlatBoardSide + "px";
		}
		if (bCrushFlatWidth && bResizeSolidB) { oSolidBoard.updateSize(); }
	}

	function stopResizing() {
		Canvas3D.removeEvent(document, "mousemove", resizeFilm);
		Canvas3D.removeEvent(document, "mouseup", stopResizing);
		etc.i3DHeight = nDeskHeight;
		updateViewSize(etc.bSolidView, true);
		oBoardsBox.style.width = nDeskWidth + "px";
		oBoardsBox.style.height = nDeskHeight + "px";
		document.body.removeChild(oFilm);
	}

	function startResizing(oMsEvnt1) {
		var iParent = oBoardsBox;
		nMinWidth = etc.bFlatView && etc.bSolidView ? nMinHeight << 1 : nMinHeight;
		if (!oMsEvnt1) { oMsEvnt1 = window.event; }
		nPageX = document.documentElement.scrollLeft || document.body.scrollLeft;
		nPageY = document.documentElement.scrollTop || document.body.scrollTop;
		iBoardsBoxX = 0;
		iBoardsBoxY = 0;
		while (iParent.offsetParent) {
			iBoardsBoxX += iParent.offsetLeft;
			iBoardsBoxY += iParent.offsetTop;
			iParent = iParent.offsetParent;
		}
		setStyles.call(oFilm, ["width", nDeskWidth + "px"], ["height", nDeskHeight + "px"], ["left", iBoardsBoxX + "px"], ["top", iBoardsBoxY + "px"]);
		document.body.appendChild(oFilm);
		nDscrsX = iBoardsBoxX - nPageX + oBoardsBox.offsetWidth - oMsEvnt1.clientX;
		nDscrsY = iBoardsBoxY - nPageY + oBoardsBox.offsetHeight - oMsEvnt1.clientY;
		Canvas3D.addEvent(document, "mousemove", resizeFilm);
		Canvas3D.addEvent(document, "mouseup", stopResizing);
		return(false);
	}

	function capitalize(sText) { return(sText.toUpperCase()); }

	function changeTagName() {
		var sOldName = this.innerHTML;
		if (sOldName === "Result") { alert("You can not change this key."); return; }
		if (bCtrlIsDown) {
			bCtrlIsDown = false;
			if (confirm("Do you want to delete this tag?")) {
				delete oGameInfo[this.innerHTML];
				this.parentNode.removeChild(this.nextSibling);
				this.parentNode.removeChild(this.nextSibling);
				this.parentNode.removeChild(this.nextSibling);
				this.parentNode.removeChild(this);
			}
		} else {


			var sNewName = prompt("Write the new name of the key.", sOldName);
			if (!sNewName) { return; }
			sNewName = sNewName.replace(/^[a-z]/, capitalize);
			if (sNewName === sOldName || sNewName.search(rDeniedTagChrs) > -1 || oGameInfo.hasOwnProperty(sNewName)) { return; }
			var oCleanInfo;
			for (var iInfoKey in oGameInfo) {
				oNewInfo[iInfoKey === sOldName ? sNewName : iInfoKey] = oGameInfo[iInfoKey];
				delete oGameInfo[iInfoKey];
			}
			oCleanInfo = oGameInfo;
			oGameInfo = oNewInfo;
			oNewInfo = oCleanInfo;
			updatePGNHeader();
			updatePGNLink();
			this.innerHTML = sNewName;
		}
	}

	function changeTagVal() {
		var sParent = this.previousSibling.previousSibling.innerHTML;
		if (sParent === "Result") { alert("You can not change the result of the game!"); return; }
		var sNewValue = prompt("Write the new value.", this.innerHTML);
		if (sNewValue === null) { return; }
		oGameInfo[sParent] = this.innerHTML = sNewValue || "?";
		updatePGNHeader();
		updatePGNLink();
	}

	function addInfoTag() {
		var newTagK = prompt("Write the name of the new tag.");
		if (!newTagK || newTagK.search(rDeniedTagChrs) > -1) { return; }
		newTagK = newTagK.replace(/^[a-z]/, capitalize);
		var bExists = false;
		for (var iExistTag in oGameInfo) {
			if (iExistTag.toLowerCase() === newTagK.toLowerCase()) { bExists = iExistTag; break; }
		}
		if (bExists) { alert(iExistTag + " already exists!"); return; }
		newTagV = prompt("Write the value of the new tag.");
		if (!newTagV) { return; }
		oGameInfo[newTagK] = newTagV;
		updatePGNHeader();
		updatePGNLink();
		var oFocusNode = this.previousSibling;
		this.parentNode.insertBefore(setAttribs.call(document.createElement("span"), ["className", "infoKey"], ["onclick", changeTagName], ["innerHTML", newTagK]), oFocusNode);
		this.parentNode.insertBefore(document.createTextNode(": "), oFocusNode);
		this.parentNode.insertBefore(setAttribs.call(document.createElement("span"), ["className", "infoVal"], ["onclick", changeTagVal], ["innerHTML", newTagV]), oFocusNode);
		this.parentNode.insertBefore(document.createElement("br"), oFocusNode);
	}

	function showInfo() {
		if (bInfoBox) { return; }
		var oInfoPar = document.createElement("p"), oNewField = document.createElement("span"), oCloseInfo = document.createElement("span");
		for (var iTagTxt in oGameInfo) {
			oInfoPar.appendChild(setAttribs.call(document.createElement("span"), ["className", "infoKey"], ["onclick", changeTagName], ["innerHTML", iTagTxt]));
			oInfoPar.appendChild(document.createTextNode(": "));
			oInfoPar.appendChild(setAttribs.call(document.createElement("span"), ["className", "infoVal"], ["onclick", changeTagVal], ["innerHTML", oGameInfo[iTagTxt]]));
			oInfoPar.appendChild(document.createElement("br"));
		}
		oInfoPar.title = "Hold down the ctrl button and click the tag name to remove all its contents.";
		setAttribs.call(oNewField, ["className", "chessCtrlBtn"], ["onclick", addInfoTag], ["innerHTML", "Add tag"]);
		setAttribs.call(oCloseInfo, ["className", "chessCtrlBtn"], ["onclick", hideInfo], ["innerHTML", "Close"]);
		oInfoPar.appendChild(document.createElement("br"));
		oInfoPar.appendChild(oNewField);
		oInfoPar.appendChild(document.createTextNode(" "));
		oInfoPar.appendChild(oCloseInfo);
		oInfoBox.appendChild(oInfoPar);
		bInfoBox = true;
	}

	function hideInfo() {
		oInfoBox.innerHTML = "";
		bInfoBox = false;
	}

	function algBoxListener(oKeyEvnt1) {
		if (oKeyEvnt1.keyCode === 13 && sendAlgebraic(this.value)) { this.value = ""; }
	}

	function algBoxFocus() {
		this.style.borderColor = "#ffff00";
		if (this.value === sAlgBoxEmpty) { this.value = ""; }
		if (bUseKeyboard) { etc.bKeyCtrl = false; }
	}

	function algBoxBlur() {
		this.style.borderColor = "";
		this.value = this.value || sAlgBoxEmpty;
		if (bUseKeyboard) { etc.bKeyCtrl = true; }
	}

	function minMaxCtrl() {
		if (oCtrlForm.style.display) {
			oCtrlForm.style.display = "";
			this.innerHTML = "&ndash;";
		} else {
			oCtrlForm.style.display = "none";
			this.innerHTML = "+";
		}
	}

	function getCtrlDown(oKeyEvnt2) { if (oKeyEvnt2.keyCode === 17) { bCtrlIsDown = true; } }

	function getCtrlUp(oKeyEvnt3) { if (oKeyEvnt3.ctrlKey) { bCtrlIsDown = false; } }

// Public APIs
	return {
		help: function() {
			if (!bReady) { return; }
			engineMove();
			bReady = false;
			window.setTimeout(engineMove, 250);
			if (etc.bFlatView && nFrstFocus) { squareFocus(nFrstFocus, false); }
		},
		organize: function(bHB) {
			resetBoard();
			flagHumanBlack = bHB ? 8 : 0;
			newPGNHeader();
			if (bHumanSide) { etc.bBlackSide = bHB; }
			if (bInfoBox) { hideInfo(); }
			if (etc.bSolidView) { oSolidBoard.update(true); }
			if (etc.bFlatView) { updateFlatCoords(); writeFlatPieces(); }
			updatePGNLink();
			if (bHB && bAI) { bReady = false; window.setTimeout(engineMove, 250); }
		},
		place: function(oWhere) {
			if (oBoardsBox) { oBoardsBox.parentNode.removeChild(oBoardsBox); }
			else {
				var oSizeHandle = document.createElement("div"), oCtrlPanel = document.createElement("div"), oMnMxCtrl = document.createElement("div"), oAlgBox = document.createElement("input"), oMovesPar = document.createElement("p"), oPGNPar = document.createElement("p"), oInfoBtn = document.createElement("span");
				etc.oFlatVwArea = document.createElement("div");
				etc.oSolidVwArea = document.createElement("div");
				oBoardsBox = document.createElement("div");
				oPGNBtn = document.createElement("a");
				oInfoBox = document.createElement("div");
				oCtrlForm = document.createElement("form");
				oMovesSelect = document.createElement("select");
				oFilm = document.createElement("div");

				setAttribs.call(oAlgBox, ["type", "text"], ["id", "chessAlgebraic"], ["value", sAlgBoxEmpty], ["onkeypress", algBoxListener], ["onfocus", algBoxFocus], ["onblur", algBoxBlur]);
				setAttribs.call(oInfoBtn, ["className", "chessCtrlBtn"], ["onclick", showInfo], ["innerHTML", "Game info"]);
				oInfoBox.id = "chessInfo";
				oBoardsBox.id = "chessboardsBox";
				oBoardsBox.onmousedown = returnFalse;
				oBoardsBox.style.width = nDeskWidth + "px";
				oBoardsBox.style.height = nDeskHeight + "px";
				setAttribs.call(oSizeHandle, ["id", "chessSizeHandle"], ["innerHTML", "&#9698;"], ["onmousedown", startResizing]);
				setAttribs.call(oMnMxCtrl, ["id", "chessClosePanel"], ["onclick", minMaxCtrl], ["onmousedown", returnFalse], ["innerHTML", "&ndash;"]);
				oPGNPar.className = "ctrlBtns";
				etc.oFlatVwArea.id = "chess2DBox";
				etc.oSolidVwArea.id = "chess3DBox";
				oCtrlForm.onsubmit = returnFalse;
				oFilm.className = "chessFilmBox";
				setAttribs.call(oMovesSelect, ["id", "chessMoves"], ["size", 10], ["onchange", synchrMovesList]),
				oPGNBtn.className = "chessCtrlBtn";
				oPGNBtn.innerHTML = "Save as PGN";
				oCtrlPanel.id = "chessCtrlPanel";

				oMovesPar.appendChild(oMovesSelect);
				oMovesPar.appendChild(document.createElement("br"));
				oMovesPar.appendChild(oAlgBox);
				oPGNPar.appendChild(oPGNBtn);
				oPGNPar.appendChild(document.createTextNode(" "));
				oPGNPar.appendChild(oInfoBtn);
				oCtrlForm.appendChild(oMovesPar);
				oCtrlForm.appendChild(oPGNPar);
				oCtrlForm.appendChild(oInfoBox);
				oCtrlPanel.appendChild(oMnMxCtrl);
				oCtrlPanel.appendChild(oCtrlForm);
				oBoardsBox.appendChild(etc.oSolidVwArea);
				oBoardsBox.appendChild(etc.oFlatVwArea);
				// oBoardsBox.appendChild(oSizeHandle);
				// document.body.appendChild(oCtrlPanel);
				Canvas3D.addEvent(document, "keydown", getCtrlDown);
				Canvas3D.addEvent(document, "keyup", getCtrlUp);
			}
			oWhere.appendChild(oBoardsBox);
			this.organize(false);
		},
		setView: function(nView) {
			if (!bReady) { return(false); }
			var bUpdateSize = false, bShow2D = Boolean(nView & 1), bShow3D = Boolean(nView & 2), bChanged2D = Boolean(nView & 1 ^ etc.bFlatView);
			if (bShow2D && bShow3D && nDeskWidth < nMinHeight << 1) {
				nDeskWidth = nMinWidth = nMinHeight << 1;
				oBoardsBox.style.width = nDeskWidth + "px";
			}
			if (bShow2D) {
				if (!etc.bFlatView) {
					showFlatBoard();
					bUpdateSize = true;
				}
			} else if (etc.bFlatView) {
				etc.oFlatVwArea.style.width = "0";
				etc.oFlatVwArea.removeChild(oBoardTable);
				etc.bFlatView = false;
				bUpdateSize = true;
			}
			if (bShow3D) { if (!etc.bSolidView) { showSolidBoard(); bUpdateSize = false; } }
			else if (etc.bSolidView) { oSolidBoard.hide(); bUpdateSize = true; }
			if (bUpdateSize) { updateViewSize(bShow3D, bChanged2D); }
			return(true);
		},
		showHide2D: function() {
			if (!bReady) { return(false); }
			if (etc.bFlatView) {
				etc.oFlatVwArea.style.width = "0";
				etc.oFlatVwArea.removeChild(oBoardTable);
				etc.bFlatView = false;
			}
			else {
				if (etc.bSolidView && nDeskWidth < nMinHeight << 1) {
					nDeskWidth = nMinWidth = nMinHeight << 1;
					oBoardsBox.style.width = nDeskWidth + "px";
				}
				showFlatBoard();
			}
			updateViewSize(etc.bSolidView, true);
			return(true);
		},
		showHide3D: function() {
			if (!bReady) { return(false); }
			if (etc.bSolidView) {
				oSolidBoard.hide();
				updateViewSize(false, false);
			} else {
				showSolidBoard();
				if (etc.bFlatView && nDeskWidth < nMinHeight << 1) {
					nDeskWidth = nMinWidth = nMinHeight << 1;
					oBoardsBox.style.width = nDeskWidth + "px";
				}
			}
			return(true);
		},
		lock: function() { if (bMotion) { bBoundLock = false; } else { bReady = false; } },
		unlock: function() { histClearIter(); bReady = true; },
		useAI: function(bMachine) { bAI = bMachine; },
		placeById: function(sNodeId) { this.place(document.getElementById(sNodeId)); },
		setPlyDepth: function(nLevel) {
			var nDepth = new Number(nLevel);
			if (isNaN(nDepth) || nDepth < 0) { return(false); }
			nPlyDepth = nDepth + 2;
			return(true);
		},
		setPromotion: function(nPromotion) { etc.nPromotion = nPromotion & 3; },
		navigate: function (nHowMany, bIterate, nTmpSpeed) {
			var nMoveFor = Number(nHowMany), bBackward = nMoveFor < 0, nHistLen1 = aHistory.length;
			if (bMotion || nMoveFor === 0 || nHistLen1 === 0) { return; }
			if (bIterate) {
				oMovesSelect.disabled = bMotion = true;
				if (bReady) { bBoundLock = true; bReady = false; }
				nMotionId = window.setInterval(function() {
					var nHistLen2 = aHistory.length;
					if (iHistPointr + nMoveFor < -1 || nMoveFor + iHistPointr > nHistLen2 - 1) {
						window.clearInterval(nMotionId);
						oMovesSelect.disabled = bMotion = false;
						if (bBackward && iHistPointr > -1) { readHistory(~iHistPointr, true); }
						else if (!bBackward && iHistPointr < nHistLen2 - 1) { readHistory(nHistLen2 - iHistPointr - 1, true); }
						if (bBoundLock) { bReady = true; }
						return;
					}
					readHistory(nMoveFor, true);
				}, nTmpSpeed || nFrameRate);
			} else {
				if (iHistPointr + nMoveFor < -1 || nMoveFor + iHistPointr + 1 > nHistLen1) {
					if (bBackward && iHistPointr > -1) { readHistory(~iHistPointr, true); }
					else if (!bBackward && iHistPointr < nHistLen1 - 1) { readHistory(nHistLen1 - iHistPointr - 1, true); }
					return;
				}
				readHistory(nMoveFor, true);
			}
		},
		stopMotion: histClearIter,
		backToStart: function() {
			if (bMotion || iHistPointr === -1) { return; }
			readHistory(~iHistPointr, true);
		},
		returnToEnd: function() {
			var nHistLen3 = aHistory.length;
			if (bMotion || iHistPointr === nHistLen3 - 1) { return; }
			readHistory(nHistLen3 - iHistPointr - 1, true);
		},
		// it's for developpers only: do not uncomment this function, please!
		// runInside: function(sJSCode) { eval(sJSCode); },
		readPGN: function(sPGNBody, bHumanBlack) {
			var iInfoField, iAlgMoves, cleanPGN = sPGNBody.replace(/\{.*\}/g, "").replace(/\s*;[^\n]\s*|\s+/g, " "), sFieldFence = "\\[[^\\]]*\\]", aFlatHeadr = cleanPGN.match(new RegExp(sFieldFence, "g")), aMovesLoaded = cleanPGN.replace(new RegExp("^\\s*(" + sFieldFence + "\\s*)*(\\d+\\.\\s*)?|\\+|\\s*((#|(\\d+(\/\\d+)?\\-\\d+(\/\\d+)?)|\\*).*)?$", "g"), "").split(/\s+\d+\.\s*/);
			resetBoard();
			for (var iOldKey in oGameInfo) { delete oGameInfo[iOldKey]; }
			if (aFlatHeadr) {
				for (var iField = 0; iField < aFlatHeadr.length; iField++) {
					iInfoField = aFlatHeadr[iField].replace(/^\[\s*|"\s*\]$/g, "").split(/\s*"\s*/);
					if (iInfoField.length > 1) { oGameInfo[iInfoField[0]] = iInfoField[1]; }
				}
			}
			for (var iDblMove = 0; iDblMove < aMovesLoaded.length; iDblMove++) {
				iAlgMoves = aMovesLoaded[iDblMove].split(/\s+/);
				if (!runAlgebraic(iAlgMoves[0], 0, false)) { break; }
				if (iAlgMoves.length < 2 || !runAlgebraic(iAlgMoves[1], 8, false)) { flagWhoMoved = 0; break; }
			}
			flagHumanBlack = bHumanBlack ? 8 : 0;
			if (bHumanSide) { etc.bBlackSide = bHumanBlack || false; }
			getInCheckPieces();
			updatePGNHeader();
			updatePGNLink();
			if (bInfoBox) { hideInfo(); }
			if (etc.bSolidView) { oSolidBoard.update(false); }
			if (etc.bFlatView) { writeFlatPieces(); }
			if (bAI && bGameNotOver && flagWhoMoved === flagHumanBlack) { bReady = false; window.setTimeout(engineMove, 250); }
		},
		readAlgebraic: sendAlgebraic,
		setFrameRate: function(nMilliseconds) { nFrameRate = nMilliseconds; },
		setDimensions: function(nNewWidth, nNewHeight) {
			nDeskWidth = nNewWidth < nMinWidth ? nMinWidth : nDeskWidth = nNewWidth - 1 | 1;
			nDeskHeight = etc.i3DHeight = nNewHeight < nMinHeight ? nMinHeight : nNewHeight - 1 | 1;
			updateViewSize(etc.bSolidView, true);
			oBoardsBox.style.width = nDeskWidth + "px";
			oBoardsBox.style.height = nDeskHeight + "px";
		},
		getDimensions: function() { return[nDeskWidth, nDeskHeight]; },
		setSide: function(nSide) { // 0: white side, 1: black side, 2: human side.
			var bWasBlack = etc.bBlackSide;
			bHumanSide = Boolean(nSide >> 1);
			if (bHumanSide) { etc.bBlackSide = Boolean(flagHumanBlack) }
			else { etc.bBlackSide = Boolean(nSide & 1); }
			if (etc.bBlackSide !== bWasBlack) {
				if (etc.bFlatView) { updateFlatCoords(); writeFlatPieces(); }
				if (etc.bSolidView) { oSolidBoard.updateView(); }
			}
		},
		useKeyboard: function(bActive) { etc.bKeyCtrl = bUseKeyboard = bActive; }
	};
})(), Canvas3D = {
	addEvent: function(oObject, strEvent, fncAction) {
		if (oObject.addEventListener) { oObject.addEventListener(strEvent, fncAction, false); }
		else if (oObject.attachEvent) { oObject.attachEvent("on" + strEvent, fncAction); }
	},
	removeEvent: function(oObject, strEvent, fncAction) {
		if (oObject.removeEventListener) { oObject.removeEventListener(strEvent, fncAction, false); }
		else if (oObject.detachEvent) { oObject.detachEvent("on" + strEvent, fncAction); }
	}
};
