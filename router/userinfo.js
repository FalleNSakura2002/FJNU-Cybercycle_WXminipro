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
const { Op } = require("sequelize");

// 用户信息相关

// 请求用户名称
router.get("/", async (req, res) => {
  var wxid = req.headers["x-wx-openid"];
  // 根据openid,请求信息
  const userinfos = await user_info.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: {
      user_wxid: wxid,
    },
  });
  res.send(userinfos);
});

// 请求用户名下车辆信息
router.get("/license", async (req, res) => {
  var wxid = req.headers["x-wx-openid"];
  // 根据openid,请求学号
  const userinfo = await user_info.findOne({
    attributes: ["user_id"],
    where: {
      user_wxid: wxid,
    },
  });
  var userid = userinfo.user_id;

  // 根据学号查询车辆信息
  const cycleinfos = await cycle_info.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: {
      cycle_user_id: userid,
    },
  });
  res.send(cycleinfos);
});

// 查询用户违章信息
router.get("/violate", async (req, res) => {
  var wxid = req.headers["x-wx-openid"];
  // 根据openid,请求学号
  const userinfo = await user_info.findOne({
    attributes: ["user_id"],
    where: {
      user_wxid: wxid,
    },
  });
  var userid = userinfo.user_id;
  // 根据学号查询车辆信息
  const cycleinfos = await cycle_info.findAll({
    attributes: ["cycle_lic_num"],
    where: {
      cycle_user_id: userid,
    },
  });

  // 根据车牌号查询
  var user_license = [];
  // 将用户车辆车牌重组为数组
  for (let i = 0; i < cycleinfos.length; i++) {
    user_license.push(cycleinfos[i].cycle_lic_num);
  }

  // 利用车牌数组查询违章事件
  const violate_events = await violate.findAll({
    attributes: ["violate_id", "violate_loc", "violate_lic_num"],
    where: {
      violate_lic_num: {
        [Op.or]: user_license,
      },
    },
  });
  res.send(violate_events);
});

//
module.exports = router;
