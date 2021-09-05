export const overrideSubMenuStyling: React.FocusEventHandler = ({
  relatedTarget,
}): void => {
  if (
    relatedTarget instanceof HTMLElement &&
    relatedTarget.classList.value === "shadow-root-host" &&
    relatedTarget.shadowRoot instanceof ShadowRoot &&
    !relatedTarget.shadowRoot.querySelector("#subMenuOverride")
  ) {
    relatedTarget.shadowRoot.appendChild(
      Object.assign(document.createElement("style"), {
        id: "subMenuOverride",
        textContent: `
          .monaco-submenu {
            left: 100% !important;
            position: absolute !important;
            top: inherit !important;
          }
        `,
      })
    );
  }
};
