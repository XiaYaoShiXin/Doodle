function create() {
    axios.post('/doodle/create').then((res) => {
        id = res.data.id;
        window.location = "/doodle/" + id;
    }).catch((err) => {
        $.Toast("创建失败", err, "error");
    });
};