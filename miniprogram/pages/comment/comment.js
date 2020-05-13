// pages/comment/comment.js
const db = wx.cloud.database(); // 初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '', //评价的内容
    score: 5, //默认是五星好评
    images: [], // 上传的图片
    fileIDs: [], // 文件ID数组
    movieId: -1,
  },

  submit: function () {
    wx.showLoading({
      title: '评论中...',
    })
    // 上传图片到云存储
    let promiseArr = [];
    for (let i = 0; i < this.data.images.length; i++) {
      let element = this.data.images[i];
      let suffix = /\.\w+$/.exec(element)[0]; //正则表达式,返回文件扩展名
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: element, // 文件路径
        }).then(res => {
          // get resource ID
          console.log(res.fileID);
          this.setData({
            fileIDs: this.data.fileIDs.concat(res.fileID),
          });
          reslove();
        }).catch(error => {
          // handle error
          console.error;
        });
      }));
    }

    Promise.all(promiseArr).then(res => {
      // 插入数据
      db.collection("comment").add({
        data: {
          content: this.data.content,
          score: this.data.score,
          fileIDs: this.data.fileIDs,
          movieid: this.data.movieId
        }
      }).then(res => {
        wx.hideLoading({
          complete: (res) => { },
        });
        wx.showToast({
          title: '评价成功!',
        });
      }).catch(err => {
        wx.hideLoading({
          complete: (res) => { },
        });
        wx.showToast({
          title: '评价失败!',
        });
      })
    });
  },

  uploadImg: function (event) {
    //选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          images: this.data.images.concat(tempFilePaths),
        })
      }
    });
  },

  onContentChange(event) {
    // event.detail 为当前输入的值
    this.setData({
      content: event.detail,
    })
  },

  onScoreChange(event) {
    this.setData({
      score: event.detail,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieId: options.movieid,
    })
    wx.cloud.callFunction({
      name: "getdetail",
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      this.setData({
        detail: JSON.parse(res.result)
      });
    }).catch(err => {
      console.error(err);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})