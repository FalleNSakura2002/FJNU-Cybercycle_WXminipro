// 建立路由
const express = require("express");
const router = express.Router();

// 导入数据库
const {
  init: initDB,
  user_info,
  cycle_info,
  course_scheme,
  monitor_video,
  violate,
  violate_img,
} = require("../db");

// 用户信息相关

// 请求用户名称
router.get("/username", async (req, res) => {
  var wxid = req.headers["x-wx-openid"];
  const username = await user_info.findOne({
    attributes: ["user_name"],
    where: {
      user_wxid: wxid,
    },
  });
  res.send(username);
});

//
module.exports = router;
