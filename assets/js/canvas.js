let canvas = {
    setting: {
        width: 1000,
        height: 500,
        backgroundColor: '#ffffff',
        title: document.getElementById("title").innerText,
        id: document.getElementsByTagName('meta')['doodle-id'].getAttribute("content")
    },
    cache: [],
    buffer: 0,
    element: document.getElementById("canvas"),
    container: document.getElementById("canvas-container"),
    mask: document.getElementById("canvas-mask"),
    title: document.getElementById("canvas-title"),
    context: null,
    setSize: (w, h) => {
        canvas.setting.width = w;
        canvas.setting.height = h;
        canvas.element.width = w;
        canvas.element.height = h;
    },
    setTitle: (title) => {
        canvas.setting.title = title;
    },
    setBackgroundColor: (color) => {
        canvas.setting.backgroundColor = color;
        canvas.element.style.backgroundColor = color;
    },
    init: (brush) => {
        canvas.setSize(canvas.setting.width, canvas.setting.height);
        canvas.setBackgroundColor(canvas.setting.backgroundColor);
        canvas.context = canvas.element.getContext("2d");
        canvas.load();
    },
    onupload: () => {
        $.Toast("保存成功", "继续愉快的创作", "success");
    },
    onload: () => {
        canvas.mask.style.opacity = 0;
        canvas.element.style.opacity = 1;
        setTimeout(() => {
            canvas.container.removeChild(canvas.mask);
            canvas.element.onmousemove = (e) => {
                if (brush.painting) brush.paintAt(e.offsetX, e.offsetY);
                brush.setPos(e.offsetX, e.offsetY);
                e.stopPropagation();
            };
            canvas.element.onmousedown = (e) => {
                brush.startPainting(canvas.context);
                canvas.save();
                brush.paintAt(e.offsetX, e.offsetY);
                e.stopPropagation();
            };
            canvas.element.onmouseup = (e) => {
                brush.stopPainting(); //鼠标拖出又拖入的BUG
                e.stopPropagation();
            };
            canvas.title.oninput = (e) => {
                canvas.setting.title = canvas.title.innerText;
            };
            document.body.onkeydown = (e) => {
                if (e.ctrlKey == true && (e.keyCode == 90 || e.keyCode == 122)) {
                    canvas.restore();
                }
            };
            canvas.autoupload();
        }, 1000);
    },
    upload: () => {
        axios.post('/save', {
            id: canvas.setting.id,
            title: canvas.setting.title,
            dataUrl: canvas.element.toDataURL()
        }).then((res) => {
            canvas.onupload();
        }).catch((err) => {
            $.Toast("上传失败", err, "error");
        });
    },
    autoupload: () => {
        setInterval(() => {
            axios.post('/save', {
                id: canvas.setting.id,
                title: canvas.setting.title,
                dataUrl: canvas.element.toDataURL()
            }).then((res) => {
                $.Toast("保存成功", "已完成自动保存", "success");
            }).catch((err) => {
                $.Toast("自动保存失败", err, "error");
            });
        }, 60000);
    },
    load: () => {
        axios.post('/load', {
            id: canvas.setting.id
        }).then((res) => {
            if (res.data.dataUrl == null) {
                canvas.onload();
                return;
            }
            let img = new Image;
            img.src = res.data.dataUrl;
            img.onload = () => {
                canvas.context.drawImage(img, 0, 0);
                $.Toast("加载成功", "开始愉快的创作吧", "success");
                canvas.onload();
            };
        }).catch((err) => {
            $.Toast("加载失败", err, "error");
        });
    },
    download: () => {
        window.open('/doodle/' + canvas.setting.id + '/download');
    },
    remove: () => {
        axios.post('/doodle/' + canvas.setting.id + '/remove').then((res) => {
            window.location = "/";
        }).catch((err) => {
            $.Toast("删除失败", err, "error");
        });
    },
    save: () => {
        canvas.cache.push(canvas.context.getImageData(0, 0, canvas.setting.width, canvas.setting.height));
    },
    restore: () => {
        canvas.context.putImageData(canvas.cache.pop(), 0, 0);
    }


};