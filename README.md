bug统计： <br>
1. 旋转bug已全部扫清~ <br>
2. 已支持手机触控，但是操作和动画都很卡 <br>

关于Safari的3D显示的bug： <br>
问题：Safari显示立方体时只显示了一面，即所有加了transform:rotate()属性的面都不见了 <br>
解决方法：经实验Safari中transform-style与perspective属性不能共存，在设置了perspective的父元素中将transform-style属性删除即可