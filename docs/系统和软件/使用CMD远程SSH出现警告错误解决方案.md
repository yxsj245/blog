---
title: 使用CMD远程SSH出现警告错误解决方案
createTime: 2025/3/21 20:27:47
permalink: /Windows/8ycuqguj/
---
![](https://pic1.zhimg.com/80/v2-bbd6761623292366a74fcf1a00e0941c_720w.png)
问题出现原因
你肯定连接的这个IP系统然后重置SSH或者重装了系统，连接密钥发生变更了，Windows默认进行了阻止连接。

解决方法
删除旧的密钥
```cmd
    ssh-keygen -R 此处替换远程连接的IP
```
然后重新连接即可

```cmd
    ssh 连接账户名@连接IP
```

