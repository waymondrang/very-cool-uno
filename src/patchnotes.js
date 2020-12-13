import { Component } from "react"

export default class Patch extends Component {
  render() {
    return (
      <div>
        <h2>v3.0 update notes</h2>
        <div className="update-contents">
          <p>
            resolved issues with websocket connection on google cloud deployment
          <br />
          published source code on <a href="https://github.com/waymondrang/very-cool-uno">github</a>
            <br />
          created patch notes component for easier updates
        </p>
          <p>
            <strong>v2.2 update notes</strong>
            <br />
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
        </div>
      </div>
    )
  }
}
