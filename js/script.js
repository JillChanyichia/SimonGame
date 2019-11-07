//--------------------------------
//          Block
//--------------------------------
var Blocks = function(blockAssign,setAssign){
  this.allOn=false
  this.blocks=blockAssign.map((d,i)=>
    ({
      name: d.name,
      el: $(d.selector),
      audio: this.getAudioObject(d.pitch)
    })
  )
  this.soundSets = setAssign.map((d,i)=>
    ({
      name: d.name,
      sets: d.sets.map((pitch)=>this.getAudioObject(pitch))
    })
  )
}
//Single block flash＋Sound(name)
Blocks.prototype.flash=function(note){
  let block = this.blocks.find(d=>d.name==note)
  if (block){
    block.audio.currentTime=0
    block.audio.play()
    block.el.addClass("active")
    setTimeout(()=>{
      if (this.allOn==false){
        block.el.removeClass("active")
      }
    },100)
  }
}
//light up all the blocks
Blocks.prototype.turnOnAll=function(note){
  this.allOn=true
  this.blocks.forEach(d=>{
    d.el.addClass("active")
  })
}
//turn off all the blocks
Blocks.prototype.turnOffAll=function(note){
  this.allOn=false
  this.blocks.forEach(d=>{
    d.el.removeClass("active")
  })
}
//Audio
Blocks.prototype.getAudioObject=function(pitch){
  return new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav")
}
//Audio order
Blocks.prototype.playSet = function(type){
  this.soundSets
    .find(set => set.name==type).sets
    .forEach(o=>{
      o.currentTime=0
      o.play()
    })
}

//--------------------------------
//          Game Mechanism
//--------------------------------
var Game = function (){
  //level define
  this.blocks = new Blocks(
    [
      {selector: ".block1", name: "1", pitch: "1"},
      {selector: ".block2", name: "2", pitch: "2"},
      {selector: ".block3", name: "3", pitch: "3"},
      {selector: ".block4", name: "4", pitch: "4"}
    ],
    [
      {name: "correct", sets: [1,3,5,8] },
      {name: "wrong", sets: [2,4,5.5,7] }
    ]
  )
  this.levels = [
    "1234",
    "12324",
    "231234",
    "41233412",
    "41323134132",
    "2342341231231423414232"
  ]
  let _this = this
  //download level
  $.ajax({
    url: "https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
    success: function(res){
      _this.levels = res
    }
  })
  //current level, and waiting time
  this.currentLevel = 0
  this.playInterval = 400
  this.mode="waiting"
}
//level start
Game.prototype.startLevel = function(){
  // console.log("start Level "+ this.currentLevel)
  this.showMessage("Level "+ this.currentLevel)
  this.startGame(this.levels[this.currentLevel])
}
//message
Game.prototype.showMessage = function(message){
  console.log(message)
  $(".status").text(message)
}
//Game Answers
Game.prototype.startGame = function(answer){
  this.mode="gamePlay"
  this.answer = answer
  let notes = this.answer.split("")
  let _this = this

  this.showStatus("")
  this.timer = setInterval(function(){
    let char = notes.shift()
    if (!notes.length){
      clearInterval(_this.timer)
      _this.startUserInput()
    }
    _this.playNote(char)
  },this.playInterval)
}
//Audio
Game.prototype.playNote = function(note){
  console.log(note)
  this.blocks.flash(note)

}
//Input
Game.prototype.startUserInput = function(){
  this.userInput = ""
  this.mode="userInput"
}
//User Input
Game.prototype.userSendInput = function(inputChar){
  if (this.mode=="userInput"){
    let tempString = this.userInput + inputChar
    this.playNote(inputChar)
    this.showStatus(tempString)
    if (this.answer.indexOf(tempString)==0){
      if (this.answer==tempString){
        this.currentLevel+=1
        this.mode=="waiting"
        setTimeout(()=>{
          this.startLevel()
        },1000)
      }
      this.userInput += inputChar
    }else{
      this.currentLevel=0
      this.mode=="reset"
      setTimeout(()=>{
        this.startLevel()
      },1000)
    }
  }
}
//Show status
Game.prototype.showStatus = function(tempString){
  $(".inputStatus").html("")
  this.answer.split("").forEach((d,i)=>{
    var circle = $("<div class='circle'></div>")
    if(i<tempString.length){
      circle.addClass("correct")
    }
    $(".inputStatus").append(circle)
  })

  if (tempString == this.answer){
    $(".inputStatus").addClass("correct")
    this.showMessage("Correct!")
    setTimeout(()=>{
      this.blocks.turnOnAll()
      this.blocks.playSet("correct")
    },500)
  }else{
    $(".inputStatus").removeClass("correct")
  }
  if (tempString==""){
    this.blocks.turnOffAll()
  }
  if (this.answer.indexOf(tempString)!=0){
    this.showMessage("Wrong! Please try again!")
    $(".inputStatus").addClass("wrong")
    this.blocks.turnOnAll()
    this.blocks.playSet("wrong")
  }else{
    $(".inputStatus").removeClass("wrong")

  }
}

//--------------------
//     Start a new game
var game = new Game()
setTimeout(function(){
  game.startLevel()
},1000)
