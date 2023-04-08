//进行包的请求
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const {
  init: initDB,
  user_info,
  cycle_info,
  course_scheme,
  monitor_video,
  violate,
  violate_img,
} = require("./db");
const { tojs } = require("./src/csv");
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
app.use(cookieParser());

// 设置静态文件路径
app.use(express.static(__dirname + "/"));

// 首页路由
app.get("/", async (req, res) => {
  res.redirect("/store_login.html");
});

// 测试服务器 ///////目前写到读取csv转为json
app.get("/test", async (req, res) => {
  // 转换格式
  const str = tojs("./csvfile/学生信息.csv");
  console.log(str);
  res.send(str);
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

ceshi;

bootstrap();
