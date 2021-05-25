import React from 'react';
import Number from './Number/Number';
import './styles.css';
import { Container, Row, Col } from 'react-bootstrap';
class Game extends React.Component {
	static bgColors = {
		playing: '#ccc',
		won: 'green',
		lost: 'red'
	};

	state = {
		gameStatus: 'new',
		remainingSeconds: this.props.initialSeconds,
		selectedIds: []
	};
	randomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

	challengeNumbers = Array.from({ length: this.props.challengeSize }).map(() =>
		this.randomNumberBetween(...this.props.challengeRange)
	);
	_ = require('lodash');
	target = this._
		.sampleSize(this.challengeNumbers, this.props.challengeSize - 2)
		.reduce((acc, curr) => acc + curr, 0);

	componentDidMount() {
		if (this.props.autoPlay) {
			this.startGame();
		}
	}

	componentWillUnmount() {
		clearInterval(this.intervalId);
	}

	startGame = () => {
		this.setState({ gameStatus: 'playing' }, () => {
			this.intervalId = setInterval(() => {
				this.setState((prevState) => {
					const newRemainingSeconds = prevState.remainingSeconds - 1;
					if (newRemainingSeconds === 0) {
						clearInterval(this.intervalId);
						return { gameStatus: 'lost', remainingSeconds: 0 };
					}
					return { remainingSeconds: newRemainingSeconds };
				});
			}, 1000);
		});
	};

	isNumberAvailable = (numberIndex) => this.state.selectedIds.indexOf(numberIndex) === -1;

	selectNumber = (numberIndex) => {
		if (this.state.gameStatus !== 'playing') {
			return;
		}
		this.setState(
			(prevState) => ({
				selectedIds: [ ...prevState.selectedIds, numberIndex ],
				gameStatus: this.calcGameStatus([ ...prevState.selectedIds, numberIndex ])
			}),
			() => {
				if (this.state.gameStatus !== 'playing') {
					clearInterval(this.intervalId);
				}
			}
		);
	};

	calcGameStatus = (selectedIds) => {
		const sumSelected = selectedIds.reduce((acc, curr) => acc + this.challengeNumbers[curr], 0);
		if (sumSelected < this.target) {
			return 'playing';
		}
		return sumSelected === this.target ? 'won' : 'lost';
	};

	render() {
		const { gameStatus, remainingSeconds } = this.state;

		return (
			<div className="game">
				<div className="target" style={{ backgroundColor: Game.bgColors[gameStatus] }}>
					{gameStatus === 'new' ? '?' : this.target}
				</div>
				<div className="challenge-numbers">
					{this.challengeNumbers.map((value, index) => (
						<Number
							key={index}
							id={index}
							value={gameStatus === 'new' ? '?' : value}
							clickable={this.isNumberAvailable(index)}
							onClick={this.selectNumber}
						/>
					))}
				</div>
				<div className="footer">
          <Row>
					{gameStatus === 'new' ? (
						<button onClick={this.startGame}>Start</button>
					) : (
            <Col xs={2} md={2} lg={2}>
						<div className="timer-value">{remainingSeconds}</div>
            </Col>
					)}
					{[ 'won', 'lost' ].includes(gameStatus) && (
            <Col xs={2} md={2} lg={2}>
						<button style={{width:80,transform:"translateX(-11px)"}} onClick={this.props.onPlayAgain}>Play Again</button>
            </Col>
					)}
          </Row>
				</div>
			</div>
		);
	}
}

export default Game;
