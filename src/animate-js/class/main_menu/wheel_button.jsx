import '../../style/main.css'
import { Link } from 'react-router-dom'
import laptopLogo from '../../asset/laptop_icon.svg'
import mobileLogo from '../../asset/mobile_icon.svg'

function WheelSlot({ x, y, deg, alphabet, title, color, date, selected, supportPC, supportMobile }) {
    return (
        <div className='wheel-slot'
            style={{ transform: 'translate(' + x + 'vw,' + y + 'vw) rotate(' + deg + 'deg)' }}
        >
            <div className={'wheel-slot-label ' + (selected ? 'selected-label' : '')}
                style={{ color: title ? color : 'black' }}>
                {alphabet + alphabet.toLowerCase()}
            </div>
            <div className={'wheel-slot-description ' + (selected ? 'selected-description' : '')}>
                < div className={'wheel-slot-device ' + (selected ? 'selected-device' : '')}>
                    {
                        title ? (
                            <>
                                {supportPC ? <img src={laptopLogo} alt='support PC' /> : ''}
                                {supportMobile ? <img src={mobileLogo} alt='support Mobile' /> : ''}
                            </>
                        ) : (
                            ''
                        )
                    }
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
                < div className={'wheel-slot-date ' + (selected ? 'selected-date' : '')}>
                    {date === undefined ? '' : new Date(date).toDateString()}
                </div>
            </div>
        </div >
    );
}

export default WheelSlot;