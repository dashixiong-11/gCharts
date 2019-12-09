class gCharts {
   constructor(chartData) {
      this.id = chartData.id
      this.xAxis = chartData.xAxis
      this.series = chartData.series
      this.paddinglr = chartData.paddinglr || 10
      this.height = chartData.height
      this.width = chartData.width
      this.selectedIndex = chartData.def || 0
      this.strokeColor = chartData.strokeColor
      this.fillColor = chartData.fillColor
      this.font = chartData.font
      this.pathObj = undefined
   }

   init() {
      this.creatCanvas()
      this.drawAxis()
      this.drawLine()
      this.drawText()
      this.drawArc()
      this.initArc()
      this.addMouseEvent()
      this.addClickEvent()
   }
   get xPath() {
      return {
         begin: {
            x: this.paddinglr,
            y: this.canvas.height - 30
         },
         end: {
            x: this.canvas.width - this.paddinglr,
            y: this.canvas.height - 30
         },
      }
   }

   get xWidth() { //x轴最大宽度
      return this.canvas.width - 4 * this.paddinglr
   }

   get xSingle() { //x轴每份的宽度
      return this.xWidth / (this.xAxis.data.length - 1) //x轴的刻度值
   }

   get ySingle() { //y轴每1像素的数值
      let dataArr = this.series.map((item) => {
         return item.value
      })
      let yMax = Math.max(...dataArr)
      let int = parseInt(yMax)
      let intArr = `${int}`.split('')
      let max = Number(intArr[0]) + 1
      let maxArr = [`${max}`]
      for (let i = 0; i < intArr.length - 1; i++) {
         maxArr.push('0')
      }
      let maxNum = Number(maxArr.join(''))
      return 150 / maxNum //得到y轴的最大值， 算出y轴的刻度值
   }

   get startX() { //数据的起始位置起始是x轴再里面
      return this.paddinglr + 10
   }

   creatCanvas() { //创建画布canvas
      this.canvas = document.getElementById(this.id)
      this.ctx = this.canvas.getContext('2d')
      let maxWidth = document.documentElement.clientWidth
      if (this.width > maxWidth) {
         this.canvas.width = maxWidth
      } else {
         this.canvas.width = this.width
      }
      if (this.height < 300) {
         this.canvas.height = 300
      } else {
         this.canvas.height = this.height
      }
   }

   drawAxis() { //初始化表格
      this.ctx.beginPath() //绘制x轴
      this.ctx.strokeStyle = '#000'
      this.ctx.moveTo(this.xPath.begin.x, this.xPath.begin.y)
      this.ctx.lineTo(this.xPath.end.x, this.xPath.end.y)
      this.ctx.stroke()


      //绘制三条 x轴线 以及确定y轴的最大坐标
      let y = this.canvas.height - 30 - 50
      for (let i = 0; i < 3; i++) {
         this.ctx.beginPath()
         this.ctx.strokeStyle = '#bdbdbd'
         this.ctx.moveTo(this.xPath.begin.x, y)
         this.ctx.lineTo(this.xPath.end.x, y)
         this.ctx.stroke()
         y -= 50
      }

   }

   drawText() { //x轴刻度文字
      let textbeginX = this.startX
      let textY = this.canvas.height - 30 + 6
      this.xAxis.data.forEach((item, index) => {
         if (index === 0 || (index + 1) % 3 === 0) {
            this.ctx.beginPath()
            this.ctx.font = '13px serif'
            this.ctx.textBaseline = 'top'
            this.ctx.textAlign = 'center'
            this.ctx.fillStyle = 'gray'
            this.ctx.fillText(item, textbeginX + this.xSingle * index, textY)
         }
      })
   }

   drawLine() { //绘制折线
      this.ctx.beginPath()
      this.ctx.strokeStyle = this.strokeColor
      this.series.forEach((item, index) => {
         let x = this.startX + this.xSingle * index
         let y = this.canvas.height - 30 - item.value * this.ySingle
         if (index === 0) {
            this.ctx.moveTo(x, y) //起始点
         } else {
            this.ctx.lineTo(x, y)
         }
      })
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.fillStyle = 'rgba(112,202,255,0.1)'
      this.ctx.moveTo(this.startX,this.canvas.height-30)
      this.series.forEach((item, index) => {
         let x = this.startX + this.xSingle * index
         let y = this.canvas.height - 30 - item.value * this.ySingle
         this.ctx.lineTo(x, y)
      })
      this.ctx.lineTo(this.startX + this.xSingle * (this.series.length-1),this.canvas.height-30)
      this.ctx.fill()
   }

   drawArc(x, y) { //再转折点上添加小圆圈
      this.ctx.beginPath()
      this.ctx.strokeStyle = this.strokeColor
      this.ctx.arc(x, y, 3, 0, Math.PI * 2, true)
      this.ctx.stroke()
      this.fillArc(x, y, 'white', 2)
   }

   fillArc(x, y, color, radius) { //填充圆圈
      this.ctx.beginPath()
      this.ctx.fillStyle = color
      this.ctx.arc(x, y, radius, 0, Math.PI * 2, true)
      this.ctx.fill()
   }

   initArc() { //动态添加圆圈，以及一个选中的实心点
      this.series.forEach((item, index) => {
         let x = this.startX + this.xSingle * index
         let y = this.canvas.height - 30 - item.value * this.ySingle
         this.drawArc(x, y)
         if (this.selectedIndex === index) {
            let textArr = item.fn(item.value, item.time)
            this.drawTooltip(x, this.xPath.begin.y, textArr)
            this.fillArc(x, y, this.fillColor, 4)
         }
      })
   }

   drawTooltip(x, y, textArr) {
      this.ctx.beginPath()
      this.ctx.strokeStyle = this.strokeColor
      this.ctx.moveTo(x, y)
      this.ctx.lineTo(x, y - 160)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.fillStyle = this.fillColor
      this.ctx.moveTo(x, y - 160)
      this.ctx.lineTo(x + 6, y - 166)
      this.ctx.lineTo(x - 6, y - 166)
      this.ctx.fill()
      let middleX = x
      let middleY = y - 166

      this.roundedRect(middleX, middleY, 50, 6, textArr, 14, 6)
   }

   roundedRect(midX, midY, height, radius, text) {
      this.ctx.font = `${this.font}px serif`
      let txt1 = text[0]
      let txt2 = text[1]
      let textwidth = this.MathRound(txt1) > this.MathRound(txt2) + 10 ? this.MathRound(txt1) : this.MathRound(txt2) + 10
      textwidth = textwidth + 10 //根据文字宽度决定文本框的宽度 所以这里适当的加宽一些
      let text2width = this.MathRound(txt2) + 10 //获取第二行文本的宽度，因为要在文本最后加一个小三角形


      let width = textwidth + 20
      let x = midX - width / 2
      let y = midY - height
      let text1X = midX
      let text1Y = y + height / 3
      let text2X = midX - 5
      let text2Y = y + height / 3 * 2
      if (midX + width / 2 > this.canvas.width) {
         x = this.canvas.width - width
         text1X = this.canvas.width - width / 2
         text2X = this.canvas.width - width / 2 - 5
      } else if (x < 0) {
         x = 0
         text1X = width / 2
         text2X = width / 2 - 5
      }
      let tri = [ //计算三角形的坐标
         {
            x: text2X + text2width / 2 + 10,
            y: text2Y
         },
         {
            x: text2X + text2width / 2 + 4,
            y: text2Y + 4
         },
         {
            x: text2X + text2width / 2 + 4,
            y: text2Y - 4
         }
      ]


      this.drawRect(x, y, width, height, radius) //画圆角框
      this.drawMark(txt1, text1X, text1Y)//添加文字
      this.drawMark(txt2, text2X, text2Y)
      this.drawTriangle(tri) //绘制第二行文字的三角形
      this.returnPath({pathX: x, pathY: y, pathWidth: textwidth, pathHeight: height})
   }

   addMouseEvent() {
      this.canvas.addEventListener('touchmove', (e) => {
         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
         this.drawAxis()
         this.drawLine()
         this.drawText()
         this.drawArc()

         this.series.forEach((item, index) => {
            let x = this.startX + this.xSingle * index
            let a = this.xSingle / 2
            if (Math.abs(e.changedTouches[0].clientX - x) < a) {
               this.selectedIndex = index
               this.initArc()
            }
         })
      })
   }

   addClickEvent() {
      this.canvas.addEventListener('click', (e) => {
         if (this.pathObj.pathX < e.clientX && this.pathObj.pathX + this.pathObj.pathWidth > e.clientX) {
            if (this.pathObj.pathY < e.clientY && e.clientY < this.pathObj.pathY + this.pathObj.pathHeight) {
               console.log(this.selectedIndex)
            }
         }
      })
   }


   MathRound(num) { //获取tool的文字的宽度
      let txtWidth = Math.round(this.ctx.measureText(num).width)
      return txtWidth
   }

   returnPath(pathObj) {
      this.pathObj = pathObj
   }

   drawTriangle(tri) {
      this.ctx.beginPath() //在文本后面添加三角形
      this.ctx.fillStyle = '#fff'
      this.ctx.moveTo(tri[0].x, tri[0].y)
      this.ctx.lineTo(tri[1].x, tri[1].y)
      this.ctx.lineTo(tri[2].x, tri[2].y)
      this.ctx.fill()
   }

   drawMark(txt, textX, textY) {
      this.ctx.beginPath()
      this.ctx.textBaseline = 'middle'
      this.ctx.textAlign = 'center'
      this.ctx.fillStyle = '#fff'
      this.ctx.fillText(txt, textX, textY)
   }

   drawRect(x, y, width, height, radius) {
      this.ctx.beginPath()
      this.ctx.fillStyle = this.fillColor
      this.ctx.moveTo(x, y + radius)
      this.ctx.lineTo(x, y + height - radius)
      this.ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
      this.ctx.lineTo(x + width - radius, y + height)
      this.ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
      this.ctx.lineTo(x + width, y + radius)
      this.ctx.quadraticCurveTo(x + width, y, x + width - radius, y)
      this.ctx.lineTo(x + radius, y)
      this.ctx.quadraticCurveTo(x, y, x, y + radius)
      this.ctx.fill()
   }
}

let yue = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
let chartData = {
   id: 'demo',
   width: 600,
   height: 300,
   paddinglr: 10,
   def:3,
   strokeColor: '#70caff',
   fillColor: '#70caff',
   xAxis: {
      data: yue
   },
   series: [
      {
         value: 3423,
         time: '2019年1月',
         fn: (value, time) => {
            return [time, `${value}元`]
         }
      },
      {
         value: 323,
         time: '2019年2月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 1423,
         time: '2019年3月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 423,
         time: '2019年4月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 923,
         time: '2019年5月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 3110,
         time: '2019年6月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 34,
         time: '2019年7月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 1223,
         time: '2019年8月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 4000,
         time: '2019年9月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 2450,
         time: '2019年10月',
         fn: (value, time) => {
            return [value, time]
         }
      },
      {
         value: 500,
         time: '2019年11月',
         fn: (value, time) => {
            return [value, time]
         }
      },
   ]

}
let chart = new gCharts(chartData)
   chart.init()
console.log(chart)
