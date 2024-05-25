import '../../style/main.css'
import { Link } from 'react-router-dom'

function WheelSlot({ x, y, deg, alphabet, title, color, selected }) {
    return (
        <div className='wheel-slot'
            style={{ transform: 'translate(' + x + 'vw,' + y + 'vw) rotate(' + deg + 'deg)' }}
        >
            <div className={'wheel-slot-label ' + (selected ? 'selected-label' : '')}
                style={{ color: title ? color : 'black' }}>
                {alphabet + alphabet.toLowerCase()}
            </div>
            {
                selected && title ? (
                    <Link className='wheel-slot-title selected-title'
                        to={'/Content/' + alphabet}
                        style={{ textDecoration: "none" }}
                    >
                        {title ? title : '(null)'}
                    </Link>
                ) : (
                    <div className={'wheel-slot-title ' + (selected ? 'selected-title' : '')}>
                        {title ? title : '(null)'}
                    </div>
                )
            }
        </div >
    );
}

export default WheelSlot;