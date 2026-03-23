import '../../style/main.css'
import { VerticalScreenCriteria } from '../constants.jsx';

function WheelSlot({ x, y, deg, aspectRatio, alphabet, hasDetailPage, selected }) {
    const labelColor = hasDetailPage ? '#16130f' : '#8b8478';

    return (
        <div className='wheel-slot'
            style={{
                transform: 'translate(' + x + (aspectRatio < VerticalScreenCriteria ? 'vh,' : 'vw,')
                    + y + (aspectRatio < VerticalScreenCriteria ? 'vh)' : 'vw)')
                    + ' rotate(' + deg + 'deg)'
            }}
        >
            <div className={'wheel-slot-label ' + (selected ? 'selected-label' : '')}
                style={{ color: labelColor }}>
                {alphabet + alphabet.toLowerCase()}
            </div>
        </div >
    );
}

export default WheelSlot;
