# 福师大早餐推荐系统

[![GitHub license](https://img.shields.io/github/license/WeixinCloud/wxcloudrun-express)](https://github.com/WeixinCloud/wxcloudrun-express)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/WeixinCloud/wxcloudrun-express/express)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/WeixinCloud/wxcloudrun-express/sequelize)
![GitHub package.json dependency version (prod)](https://img.shields.io/badge/ejs-%5E3.1.8-blue)
![GitHub package.json dependency version (prod)](https://img.shields.io/badge/cookie--parser-%5E1.4.6-blue)

本项目基于微信云托管 Node.js Express 框架模版二次修改。主要用于实现福师大早餐推荐系统后台管理面板和小程序的相关请求。
前端程序https://gitee.com/cui-zhenfei/wechat-applet

## 项目结构说明

```
.
├── Dockerfile
├── README.md
├── container.config.json
├── db.js
├── index.js
├── index.html
├── package.json
```

- `index.js`：项目入口
- `db.js`：数据库相关实现，使用 `sequelize` 作为 ORM
- `index.html`：首页代码
- `store_login.html`：登录页面代码
- `store_register.html`：注册页面代码
- `store_register_err.ejs`：页面报错渲染模板
- `store_register_ok.ejs`：注册成功渲染模板
- `store_main.ejs`：后台管理页面渲染模板
- `package.json`：Node.js 项目定义文件
- `container.config.json`：模板部署「服务设置」初始化配置（二开请忽略）
- `Dockerfile`：容器配置文件

## 用户信息 API 接口

### `GET /userinfo`

请求用户信息

#### 请求参数

微信 openID

#### 响应结果

- `user_wxid`: 用户微信 openID
- `user_name`: 用户姓名
- `user_academy`: 用户所属学院
- `user_bedroom`: 用户宿舍
- `user_phone`: 用户手机号
- `user_cycle_sit`: 用户拥车情况(`1`为拥有, `0`为不拥有)
- `user_class_name`: 用户所属教学班
- `user_credit`: 用户信用分

#### 响应结果示例

```json
{
  "user_wxid": "wx_16323",
  "user_id": "100002019011",
  "user_name": "柴文",
  "user_academy": "心理学院",
  "user_bedroom": "桂苑10_301",
  "user_phone": "13379046420",
  "user_cycle_sit": 1,
  "user_class_name": "2022级心理学类1班",
  "user_credit": 12
}
```

### `GET /userinfo/license`

请求用户拥有的所有车辆信息

#### 请求参数

微信 openID

#### 响应结果

- `cycle_id`: 用户车辆 ID
- `cycle_user_id`: 用户学号
- `cycle_user_name`: 用户姓名
- `cycle_lic_num`: 车辆车牌号

#### 响应结果示例

```json
[
  {
    "cycle_id": "0",
    "cycle_user_id": "100002019011",
    "cycle_user_name": "柴文",
    "cycle_lic_num": "B4755"
  },
  {
    "cycle_id": "100012",
    "cycle_user_id": "100002019011",
    "cycle_user_name": "柴文",
    "cycle_lic_num": "C2312"
  }
]
```

### `GET /userinfo/violate`

请求用户所有的违章信息

#### 请求参数

微信 openID

#### 响应结果

- `violate_id`: 违章事件 ID
- `violate_loc`: 违章地点
- `violate_lic_num`: 违章车辆车牌号

#### 响应结果示例

```json
[
  {
    "violate_id": "1",
    "violate_loc": "嘉树园",
    "violate_lic_num": "B4755"
  },
  {
    "violate_id": "2",
    "violate_loc": "桃李园",
    "violate_lic_num": "B4755"
  },
  {
    "violate_id": "3",
    "violate_loc": "桃李园",
    "violate_lic_num": "C2312"
  }
]
```

## License

[MIT](./LICENSE)
