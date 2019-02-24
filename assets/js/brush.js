let brush = {
    painting: false,
    context: null,
    setting: {
        color: "#000000",
        size: 10,
        type: 'brush'
    },
    element: document.getElementById("brush"),
    setColor: (color) => {
        brush.setting.color = color;
        brush.element.style.backgroundColor = color;
    },
    setSize: (size) => {
        brush.setting.size = size;
        brush.element.style.width = size + 'px';
        brush.element.style.height = size + 'px';
        brush.element.style.marginTop = -size / 2 + 'px';
        brush.element.style.marginLeft = -size / 2 + 'px';
    },
    setType: (type) => {
        brush.setting.type = type;
    },
    setPos: (x, y) => {
        brush.element.style.left = x + 'px';
        brush.element.style.top = y + 'px';
    },
    init: () => {
        brush.setColor(brush.setting.color);
        brush.setSize(brush.setting.size);
    },
    startPainting: (context) => {
        brush.painting = true;
        brush.context = context;
        brush.context.beginPath();
        brush.context.lineCap = "round";
        brush.context.lineWidth = brush.setting.size;
    },
    paintAt: (x, y) => {
        brush.context.lineTo(x, y);
        brush.context.strokeStyle = brush.setting.color;
        switch (brush.setting.type) {
            case 'eraser':
                brush.context.globalCompositeOperation = "destination-out";
                break;
            case 'brush':
            default:
                brush.context.globalCompositeOperation = "source-over";
        }
        brush.context.stroke();
    },
    stopPainting: () => {
        brush.painting = false;
        brush.context = null;
    }
};