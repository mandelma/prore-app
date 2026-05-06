export const getChatWindowGeometry = ({ x, y, viewportW, viewportH, side }) => {
    const isMobile = viewportW <= 640;

    const buttonW = 57;
    const buttonH = 67;
    const gap = 12;

    const sideMargin = isMobile ? 8 : 10;
    const topMargin = isMobile ? 8 : 10;
    const bottomMargin = isMobile ? 8 : 32;

    const winW = Math.min(360, viewportW - sideMargin * 2);
    const winH = Math.min(
        isMobile ? 420 : 520,
        viewportH - topMargin - bottomMargin
    );

    const leftOffset =
        side === "left"
            ? -winW - gap + buttonW
            : buttonW + gap;

    const topOffset = 0;

    return {
        buttonW,
        buttonH,
        gap,
        sideMargin,
        topMargin,
        bottomMargin,
        winW,
        winH,
        leftOffset,
        topOffset,
        absLeft: x + leftOffset,
        absTop: y + topOffset,
        absRight: x + leftOffset + winW,
        absBottom: y + topOffset + winH,
    };
}

export const getBottomRightAnchor = () => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const g = getChatWindowGeometry({
        x: viewportW,
        y: viewportH,
        viewportW,
        viewportH,
        side: "left",
    });

    return {
        x: viewportW - g.winW - g.sideMargin,
        y: viewportH - g.winH - g.bottomMargin,
        side: "left",
    };
}