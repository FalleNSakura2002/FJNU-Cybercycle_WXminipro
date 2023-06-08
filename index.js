//进行包的请求
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser"); //body参数解析
const {
  init: initDB,
  user_info,
  cycle_info,
  course_scheme,
  monitor_video,
  violate,
  violate_img,
} = require("./db");
const { usertojs, coursetojs, cycletojs } = require("./src/csv");
const { Association, Sequelize } = require("sequelize");
//使用sd,用于快速设置时间
const sd = require("silly-datetime");
//使用ejs,用于渲染前端界面
const ejs = require("ejs");
//使用cookie-parser,用于设置Cookie
const cookieParser = require("cookie-parser");
// 引入fs
const fs = require("fs");

const logger = morgan("tiny");
//建立服务器连接
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(logger);
app.set("view engine", "ejs");
app.set("views", "./");
app.use(cookieParser("Cybercycle"));

// 引入router
app.use("/", require("./router"));

// 设置静态文件路径
app.use(express.static(__dirname + "/"));

// 首页路由
app.get("/", async (req, res) => {
  res.redirect("/store_login.html");
});

// 小程序调用方法

// 根据微信ID返回名称
app.get("/wxmini/username", async (req, res) => {
  const username = await user_info.findOne({
    attributes: ["user_name"],
    where: {
      user_wxid: req.headers["x-wx-openid"],
    },
  });
});

// 初始化用方法
// 写入学生信息
app.post("/write_user", async (req, res) => {
  // 转换格式
  const str = usertojs("./csvfile/学生信息.csv");
  res.send("ok");
});

// 写入教学班信息
app.post("/write_course", async (req, res) => {
  const str = coursetojs("./csvfile/Class_scheme.csv");
  res.send("ok");
});

// 写入车辆信息
app.post("/write_cycle", async (req, res) => {
  const str = cycletojs();
  console.log(str);
  res.send("userdata");
});

const port = process.env.PORT || 8080;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
