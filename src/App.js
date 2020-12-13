import './App.css';
import React, { Component } from 'react';
import { io } from 'socket.io-client';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { v4 as uuid } from 'uuid';
import cookie from 'cookie';

/**
 * PRE-DEPLOY CHECKLIST
 * - UPDATE VERSION, UPDATE NOTES
 * - RE-ENABLE window.io()
 * - REMOVE ANY DEVELOPMENT PROPS
 */

const map = require('./map.json')

var socket = io();

var defaultcard = `data:image/png;base64,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`;

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: "",
      usernameconfirmed: false,
      number: "",
      input: "",
      debug: "",
      debugmode: false,
      disabled: true,
      room: "",
      roomconfirmed: "",
      socketid: "",
      playerlist: {},
      admin: false,
      uno_hand: [],
      topCard: {},
      publicDeckLength: 0,
      default: [{ "6_green": { "color": "#4caf50", "card": "6" } }, { "9_yellow": { "color": "#ffc107", "card": "9" } }, { "4_red": { "color": "#f44336", "card": "4" } }, { "2_yellow": { "color": "#ffc107", "card": "2" } }, { "0_green_1": { "color": "#4caf50", "card": "0" } }, { "wild_draw_4": { "card": "wild" } }],
      gameStarted: false,
      templateCards: [`template_card_0`],
      darkMode: false,
      playerOrder: [],
      playerOrderReverse: false,
      showModal: false
    }

    //disable in development
    socket = window.io('/')

    this.onUsernameInputChange = this.onUsernameInputChange.bind(this)
    this.displayNumber = this.displayNumber.bind(this)
    this.onRoomInputChange = this.onRoomInputChange.bind(this)
    this.connect = this.connect.bind(this)
    this.saveUsername = this.saveUsername.bind(this)
    this.startGame = this.startGame.bind(this)
    this.drawCard = this.drawCard.bind(this)
    this.useCard = this.useCard.bind(this)
    this.handleUsernameKeyPress = this.handleUsernameKeyPress.bind(this)
    this.handleRoomKeyPress = this.handleRoomKeyPress.bind(this)
    this.darkMode = this.darkMode.bind(this)

  }

  componentDidMount() {
    console.log(document.cookie)
    var cookies = cookie.parse(document.cookie)
    if (cookies["darkmode"] === "true") {
      this.darkMode()
      this.setState({
        darkMode: true
      })
    }
    if (cookies["usernamesave"]) {
      this.setState({
        username: cookies["usernamesave"]
      })
    }
    this.usernameinput.focus()
    const urlparams = new URLSearchParams(window.location.search);
    if (urlparams.get("snorlax") === "zzz") {
      this.setState({
        admin: true
      })
      console.log("admin mode activated")
    }
    const self = this;
    socket.on("connect", function () {
      self.setState({
        socketid: socket.id
      })
    })
    socket.on("disconnect", function () {
      self.setState({
        socketid: socket.id,
        roomconfirmed: "",
        playerlist: {}
      })
    })
    socket.on("user-connected", function (data) {
      console.log("new user connected")
      socket.emit("user-update", { room: self.state.roomconfirmed, username: self.state.username })
      var playerlist = self.state.playerlist;
      playerlist[data.socketid] = { username: data.username, cards: [] }
      console.log(playerlist)
      self.setState({
        playerlist: playerlist,
      })
    })
    socket.on("user-disconnected", function (data) {
      console.log("user disconnected")
      var playerlist = self.state.playerlist;
      delete playerlist[data.socketid]
      console.log(playerlist)
      var playerOrder = data.playerOrder || self.state.playerOrder;
      self.setState({
        playerlist: playerlist,
        playerOrder: playerOrder
      })
    })
    socket.on("joined-room", function (data) {
      console.log(`joined room ${data.room}`)
      self.setState({
        roomconfirmed: data.room,
      })
    })
    socket.on("user-update", function (data) {
      console.log("user update package incoming")
      var playerlist = self.state.playerlist;
      playerlist[data.socketid] = { username: data.username, cards: [] }
      console.log(playerlist)
      self.setState({
        playerlist: playerlist
      })
    })
    socket.on("card-drew", function (data) {
      var draw = data.draw
      var hand = self.state.uno_hand;
      hand.push(draw)
      console.log(hand)
      self.setState({
        uno_hand: hand
      })
    })
    socket.on("game-started", async function (data) {
      console.log("game-started")
      var players = self.state.playerlist;
      for (var player of Object.keys(players)) {
        players[player]["cards"] = []
      }
      self.setState({
        uno_hand: [],
        topCard: {},
        publicDeckLength: data.length,
        gameStarted: true,
        templateCards: [`template_card_0`],
        playerlist: players,
        playerOrderReverse: false
      })
      var i = 0;
      while (i < 5) {
        console.log("adding template")
        var template = self.state.templateCards;
        console.log(template)
        template.push(`template_card_${i + 1}`)
        self.setState({
          templateCards: template
        })
        await new Promise(function (resolve, reject) {
          setTimeout(function () {
            resolve()
          }, 20)
        })
        i++
      }
    })
    socket.on("publicdeck-update", function (data) {
      self.setState({
        publicDeckLength: data.length
      })
    })
    socket.on("currentcard-update", function (data) {
      console.log("current card update", data)
      self.setState({
        topCard: data.card,
        playerOrderReverse: data.reverse
      })
    })
    socket.on('player-hand-update', function (data) {
      var socketid = data.socket;
      var count = +data.count;
      if (!self.state.playerlist[socketid] || !count || count < 1) {
        console.log("count not update player hand count, does not exist")
      }
      var cards = []
      var i = 0;
      while (i < data.count) {
        cards.push(uuid())
        i++
      }
      var players = self.state.playerlist;
      players[socketid]["cards"] = cards;
      self.setState({
        playerlist: players
      })
    })
    socket.on("player-order", function (data) {
      var playerOrder = data.playerOrder;
      self.setState({
        playerOrder: playerOrder
      })
    })
  }

  connect() {
    if (this.state.usernameconfirmed && this.state.room) {
      if (this.state.roomconfirmed) {
        socket.close()
      }
      if (socket.disconnected) {
        socket.open()
      }
      socket.emit("join-room", { room: this.state.room, username: this.state.username })
      this.setState({
        socketid: socket.id,
        roomconfirmed: "",
        playerlist: {},
        playerOrder: []
      })
    }
  }

  disconnect() {
    if (socket.connected) {
      socket.close()
    }
  }

  async displayNumber(number, time) {
    this.setState({
      number: number,
      disabled: true
    })
    await new Promise(function (resolve, reject) {
      setTimeout(() => {
        resolve()
      }, time)
    })
    this.setState({
      number: "",
      disabled: false
    })
  }

  onUsernameInputChange(e) {
    this.setState({
      username: e.target.value.replace(/[^0-9a-zA-Z\_\-\=\+\!\@\#\$\%\^\&\*\(\)\ ]/gm, "")
    })
  }

  onNumberInputChange(e) {
    this.setState({
      input: e.target.value
    })
  }

  onRoomInputChange(e) {
    this.setState({
      room: e.target.value
    })
  }

  saveUsername() {
    const self = this;
    if (this.state.username && this.state.username.length < 30) {
      this.setState({
        usernameconfirmed: true
      }, function () {
        self.roominput.focus()
      })
      document.cookie = `usernamesave=${this.state.username}`
    }
  }

  async startGame() {
    socket.emit("start-game", { room: this.state.roomconfirmed })
    console.log("game-started")
  }

  drawCard() {
    console.log("drawing card")
    if (!this.state.roomconfirmed || this.state.publicDeckLength < 1) {
      return
    }
    socket.emit("draw-card", { room: this.state.roomconfirmed, count: this.state.uno_hand.length })
  }

  useCard(card) {
    var id = Object.keys(card)[0];
    var hand = this.state.uno_hand;
    if (false) {
      hand.push(card)
      this.setState({
        topCard: card
      })
      return
    }
    var index = (this.state.uno_hand).map(function (e) { return Object.keys(e)[0] }).indexOf(id);
    hand.splice(index, 1);
    socket.emit("use-card", { card: card, room: this.state.roomconfirmed, player: this.state.username, count: this.state.uno_hand.length })
    this.setState({
      uno_hand: hand
    })
  }

  handleUsernameKeyPress(e) {
    if (e.key === "Enter") {
      this.saveUsername()
    }
  }

  handleRoomKeyPress(e) {
    if (e.key === "Enter") {
      this.connect()
    }
  }

  takeCard() {
    console.log(this.state.topCard)
  }

  darkMode() {
    if (!this.state.darkMode) {
      document.body.style.backgroundColor = "#212121"
    } else {
      document.body.style.backgroundColor = "#fff"
    }
    document.cookie = `darkmode=${!this.state.darkMode}`
    this.setState({
      darkMode: !this.state.darkMode
    })
  }

  render() {
    return (
      <div className="container">
        <span onClick={() => this.setState({ showModal: !this.state.showModal })} className={`version ${this.state.darkMode ? `dark-mode` : ``}`}>v2.2, last updated 12-12-2020</span>
        {this.state.showModal ?
          <div className="update-notes">
            <h2>v2.2 update notes</h2>
            <p>
              reworked user inputs for improved mobile experience
            <br />
            changed placeholder text for inputs
            <br />
            added dark/light mode to more elements
            <br />
            centered text on smaller screens
            <br />
            display version and last updated
            <br />
            updates notes modal
            <br />
            link to chiyeon's github profile
            <br />
            added thematic elements, happy holidays!
            </p>
            <button className="update-close" onClick={() => this.setState({ showModal: false })}>close 🎅</button>
          </div> : ""}
        <div className="title">
          <h1 style={{ color: this.state.darkMode ? `#fff` : `#212121` }}>vEry cool UNO</h1>
          <span className="uno-element subtitle" style={{ color: this.state.darkMode ? `#fff` : `#212121` }}>{`made with 💗 by raymond wang`}</span>
        </div>
        <div className="inputs">
          <div className={`field uno-element ${this.state.darkMode ? `dark-mode` : ``}`}>
            <div className="label-multi">
              <span className="label">1.username</span>
            </div>
            <div className="field-input">
              <input ref={input => (this.usernameinput = input)} tabIndex="0" disabled={this.state.usernameconfirmed} value={this.state.username} onChange={this.onUsernameInputChange} placeholder="santa claus" onKeyDown={this.handleUsernameKeyPress}></input>
              <button style={{ borderRadius: `0 6px 6px 0` }} disabled={this.state.usernameconfirmed} onClick={this.saveUsername}>{this.state.usernameconfirmed ? `saved!` : `save`}</button>
            </div>
          </div>
          <div className={`field uno-element ${this.state.darkMode ? `dark-mode` : ``}`}>
            <div className="label-multi">
              <span className="label">2.room</span>
              <span className={`label ${this.state.roomconfirmed ? `green` : `red`}`}>{this.state.roomconfirmed ? `connected` : `not connected`}</span>
            </div>
            <div className="field-input">
              <input ref={input => (this.roominput = input)} tabIndex="1" onFocus={e => e.currentTarget.select()} disabled={!this.state.usernameconfirmed || this.state.roomconfirmed} placeholder="north pole" value={this.state.room} onChange={this.onRoomInputChange} onKeyDown={this.handleRoomKeyPress}></input>
              <button style={{ borderRadius: `0 6px 6px 0` }} disabled={!this.state.usernameconfirmed || this.state.roomconfirmed} onClick={this.connect}>{this.state.roomconfirmed ? "connected!" : "connect"}</button>
            </div>
          </div>
          {this.state.admin ?
            <div className={`field uno-element ${this.state.darkMode ? `dark-mode` : ``}`}>
              <div className="label-multi">
                <span className="label">admin mode</span>
              </div>
              <div className="field-input">
                <button onClick={this.startGame}>start game!</button>
              </div>
            </div> : ""}
        </div>
        {this.state.debugmode ?
          <div className="debug">
            <p>debugging</p>
            <p>{this.state.socketid ? `connected to socket [${this.state.socketid}]` : `not connected to socket`}</p>
            <p>current room: {this.state.roomconfirmed || "[none]"}</p>
            <p>username: {this.state.username}</p>
            <input type="number" value={this.state.debug} onChange={this.onDebugInputChange}></input>
            <button onClick={() => this.displayNumber(this.state.debug, 1000)}>begin test</button>
            <p>players in room: {Object.keys(this.state.playerlist).length}</p>
            {this.state.roomconfirmed ? <span>me [{this.state.socketid}]</span> : <span>connect to a room to join other players!</span>}
            {Object.keys(this.state.playerlist).map(socketid => <span>{this.state.playerlist[socketid]["username"]} [{socketid}]</span>)}
          </div> : ""}
        <div className="uno-container">
          {this.state.playerOrder.length ?
            <div className="uno-order">
              <div className={`uno-playerorder`} style={{ backgroundColor: this.state.darkMode ? `#37474f` : `#cfd8dc` }}>
                {this.state.playerOrder.map(e => <div key={Object.keys(e)[0]} className={`uno-playerorder-card`}>
                  {this.state.playerOrderReverse ?
                    <svg className="order-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={this.state.darkMode ? `#fff` : `#212121`} style={{ transform: this.state.playerOrderReverse ? `rotate(180deg)` : `none` }}>
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M16.01 11H5c-.55 0-1 .45-1 1s.45 1 1 1h11.01v1.79c0 .45.54.67.85.35l2.78-2.79c.19-.2.19-.51 0-.71l-2.78-2.79c-.31-.32-.85-.09-.85.35V11z" />
                    </svg> : ""}
                  <span className="uno-playerorder-name" style={{ color: this.state.darkMode ? `#fff` : `#212121`, backgroundColor: this.state.darkMode ? `#102027` : `#fff` }}>{e[Object.keys(e)[0]]["username"]}</span>
                  {!this.state.playerOrderReverse ?
                    <svg className="order-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={this.state.darkMode ? `#fff` : `#212121`} style={{ transform: this.state.playerOrderReverse ? `rotate(180deg)` : `none` }}>
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M16.01 11H5c-.55 0-1 .45-1 1s.45 1 1 1h11.01v1.79c0 .45.54.67.85.35l2.78-2.79c.19-.2.19-.51 0-.71l-2.78-2.79c-.31-.32-.85-.09-.85.35V11z" />
                    </svg> : ""}
                </div>)}
              </div>
              {/*<span className="label">order</span>*/}
            </div> : ""}
          <div className="uno-middle">
            <div onClick={() => this.drawCard()} className="uno-top-card-container-default">
              <div className={`uno-deck uno-element ${this.state.publicDeckLength > 0 ? `full` : ``}`}>
                <img draggable="false" src={defaultcard}></img>
              </div>
              <span className="uno-card-info" style={{ color: this.state.darkMode ? `#fff` : `#212121` }}>{this.state.gameStarted ? this.state.publicDeckLength < 1 ? `no more!` : this.state.publicDeckLength : `...`}</span>
            </div>
            {Object.keys(this.state.topCard).length ?
              <TransitionGroup className="uno-top-card-container">
                <CSSTransition key={`topcard_${Object.keys(this.state.topCard)[0]}`} classNames="uno-new-top-card" timeout={{ enter: 500, exit: 1000 }} className="uno-top-card uno-element" style={{ backgroundColor: `${this.state.topCard[Object.keys(this.state.topCard)[0]]["color"]}`, border: this.state.topCard[Object.keys(this.state.topCard)[0]]["border"] ? `4px solid ${this.state.topCard[Object.keys(this.state.topCard)[0]]["border"]}` : this.state.topCard[Object.keys(this.state.topCard)[0]]["color"] ? `4px solid ${this.state.topCard[Object.keys(this.state.topCard)[0]]["color"]}` : `4px solid #fff` }}>
                  <img onClick={() => this.takeCard()} draggable="false" src={this.state.topCard[Object.keys(this.state.topCard)[0]]["src"] ? this.state.topCard[Object.keys(this.state.topCard)[0]]["src"] : this.state.topCard[Object.keys(this.state.topCard)[0]]["card"] ? `${map[`${this.state.topCard[Object.keys(this.state.topCard)[0]]["card"]}`]}` : defaultcard}></img>
                </CSSTransition>
                <span className="uno-card-info" style={{ color: this.state.darkMode ? `#fff` : `#212121` }}>{this.state.topCard[Object.keys(this.state.topCard)[0]]["player"]}</span>
              </TransitionGroup> :
              <div className="uno-top-card-container-default" key={`uno-default`}>
                <div className="uno-top-card uno-element" style={{ border: `4px solid #fff` }}>
                  <img draggable="false" src={defaultcard}></img>
                </div>
                <span className="uno-card-info" style={{ color: this.state.darkMode ? `#fff` : `#212121` }}>...</span>
              </div>}
          </div>
          {this.state.gameStarted ?
            this.state.uno_hand.length ?
              <TransitionGroup className="uno-hand uno-element" style={{ backgroundColor: Object.keys(this.state.topCard).length ? this.state.topCard[Object.keys(this.state.topCard)[0]]["color"] ? `${this.state.topCard[Object.keys(this.state.topCard)[0]]["color"]}20` : `#eceff120` : `#eceff120` }}>
                {this.state.uno_hand.map(e =>
                  <CSSTransition classNames="uno-transition" timeout={{ enter: 0, exit: 0 }} key={Object.keys(e)[0]} onClick={() => this.useCard(e)}>
                    <div className="uno-card" style={{ backgroundColor: `${e[Object.keys(e)[0]]["color"]}`, border: e[Object.keys(e)[0]]["border"] ? `4px solid ${e[Object.keys(e)[0]]["border"]}` : e[Object.keys(e)[0]]["color"] ? `4px solid ${e[Object.keys(e)[0]]["color"]}` : `4px solid #fff` }}>
                      <img alt={e} draggable="false" src={e[Object.keys(e)[0]]["src"] ? e[Object.keys(e)[0]]["src"] : `${map[`${e[Object.keys(e)[0]]["card"]}`]}`}></img>
                    </div>
                  </CSSTransition>)}
              </TransitionGroup> :
              <TransitionGroup className="uno-hand uno-element" style={{ backgroundColor: Object.keys(this.state.topCard).length ? this.state.topCard[Object.keys(this.state.topCard)[0]]["color"] ? `${this.state.topCard[Object.keys(this.state.topCard)[0]]["color"]}20` : `#eceff120` : `#eceff120` }}>
                {this.state.templateCards.map((e) =>
                  <CSSTransition key={e} classNames="uno-empty-transition" timeout={{ enter: 0, exit: 0 }}>
                    <div className="empty-uno-card">
                      <img alt={e} draggable="false" src={defaultcard}></img>
                    </div>
                  </CSSTransition>)}
              </TransitionGroup> :
            <div className="uno-hand uno-element" style={{ backgroundColor: Object.keys(this.state.topCard).length ? this.state.topCard[Object.keys(this.state.topCard)[0]]["color"] ? `${this.state.topCard[Object.keys(this.state.topCard)[0]]["color"]}20` : `#eceff120` : `#eceff120` }}>
              {/* remove onClick listener on this.state.default.map when done prototyping! */}
              {this.state.default.map(e => <div key={Object.keys(e)[0]} className="uno-card" style={{ backgroundColor: `${e[Object.keys(e)[0]]["color"]}`, border: e[Object.keys(e)[0]]["border"] ? `4px solid ${e[Object.keys(e)[0]]["border"]}` : e[Object.keys(e)[0]]["color"] ? `4px solid ${e[Object.keys(e)[0]]["color"]}` : `4px solid #fff` }}>
                <img alt={e} draggable="false" src={e[Object.keys(e)[0]]["src"] ? e[Object.keys(e)[0]]["src"] : `${map[`${e[Object.keys(e)[0]]["card"]}`]}`}></img>
              </div>)}
            </div>}
          {Object.keys(this.state.playerlist).length ?
            <div className="uno-players uno-element">
              {Object.keys(this.state.playerlist).map(f =>
                <div key={f} className={`uno-player-card ${this.state.playerlist[f]["cards"].length ? `cards` : ``}`} style={{ backgroundColor: this.state.darkMode ? `#37474f` : `#cfd8dc`, color: this.state.darkMode ? `#fff` : `#212121` }}>
                  <span style={{ marginRight: this.state.playerlist[f]["cards"].length ? `12px` : `` }}>{this.state.playerlist[f]["username"]}</span>
                  <div className="uno-player-cards">
                    {this.state.playerlist[f]["cards"].map(g =>
                      <div key={g} className="uno-player-card-indicator"></div>
                    )}
                  </div>
                </div>
              )}
            </div> : ""}
          <span className="uno-card-info uno-element" style={{ backgroundColor: this.state.darkMode ? `#37474f` : `#eceff1`, borderRadius: `500px`, padding: `2px 12px`, color: this.state.darkMode ? `#fff` : `#212121` }}>custom cards created by <a style={{ color: this.state.darkMode ? `#fff` : `#212121` }} href="https://github.com/chiyeon">chiyeon</a> 🃏</span>
          <button style={{ backgroundColor: this.state.darkMode ? `#fff` : `#37474f`, color: this.state.darkMode ? `#212121` : `#fff` }} className="mode-button" onClick={() => this.darkMode()}>{this.state.darkMode ? `light mode 🌞🎄` : `dark mode 🌚🎄`}</button>
        </div>
      </div>
    )
  }
}