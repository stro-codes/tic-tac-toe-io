import React from 'react'
import { Container, Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

const io = require('socket.io-client')

export default class Game extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            history: [
            {
                squares: Array(9).fill(null)
            }
            ],
            stepNumber: 0,
            xIsNext: true,
            room: "defualt",
            roomSelected: false,
        }
    }

    initSocket() {        
        this.socket = io.connect('localhost:8000')

        this.socket.on('connect', () => {
            console.log('Successful Connection!')
        
            this.socket.emit('joinRoom', this.state.room)

            this.socket.emit('sendMessage', this.state.room, 'user has joined the room')
        })

        this.socket.on('allRooms', (rooms) => {
            console.log('rooms', rooms)
            
        })

        this.socket.on('getMessage', (message) => {
            console.log('new message', message) 
        })

        this.socket.on('getState', (state) => {
            console.log('new state', state)
            this.setState(state)

            document.getElementById('game-board').style.pointerEvents = 'auto'
        })

        this.socket.on('gameStart', () => {
            document.getElementById('game-board').style.pointerEvents = 'auto'
        })
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";

        this.setState({
            history: history.concat([
            {
                squares: squares
            }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
        
        this.socket.emit('sendState', this.state.room, {
            history: history.concat([
            {
                squares: squares
            }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext            
        })

        document.getElementById('game-board').style.pointerEvents = 'none'
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
    
        const moves = history.map((step, move) => {
            const desc = move ?
            'Go to move #' + move :
            'Go to game start';
            return (
            <li key={move}>
                <button onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
            );
        });
    
        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }
    
        return (
            <>
                { this.state.roomSelected ? 
                    <div className="game">
                        <div id="game-board" className="game-board" style={{ pointerEvents: "none" }}>
                            <Board
                            squares={current.squares}
                            onClick={i => this.handleClick(i)}
                            />
                        </div>

                        <div className="game-info">
                            <div>{status}</div>
                            <ol>{moves}</ol>
                        </div>
                    </div>
                : 
                    <Container className="d-flex justify-content-center" fluid>
                        <Row className="d-flex flex-row">
                            <Col className="d-flex flex-column" >
                                <h1>Join or Create a Session!</h1>

                                <InputGroup className="mb-3">
                                    <FormControl
                                        placeholder="Room Name"
                                        onChange={e => this.setState({ room: e.target.value })}
                                    />

                                    <InputGroup.Append>
                                        <Button 
                                            variant="outline-secondary"
                                            onClick={() => { 
                                                this.setState({ roomSelected: true })
                                                this.initSocket()
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>
                        </Row>
                    </Container> 
                }
            </>
        );
    }

}


function Square(props) {
    return (
    <button className="square" onClick={props.onClick}>
        {props.value}
    </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
        <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />
        );
    }

    render() {
        return (
        <div>
            <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
            </div>
            <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
            </div>
            <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
            </div>
        </div>
        );
    }
}
  
// ========================================

function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null
}