export default function ScoreCard (props) {
    const game = props.game;
    return (
        <div className='score-card' key={game.id + game.difficulty}>
            <div className='game-difficulty'>{game.difficulty}</div>
            <div className='game-results'>
                <div className='game-wins'>
                    <span>Wins: </span>
                    <span>{game.wins}</span>
                </div>
                <div className='game-losses'>
                    <span>Losses: </span>
                    <span>{game.losses}</span>
                </div>
                <div className='game-wlratio'>
                    <span>W/L Ratio: </span>
                    <span>{game.wlratio}%</span>
                </div>
            </div>
        </div>
    )
}