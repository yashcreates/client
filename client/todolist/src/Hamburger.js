import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket} from '@fortawesome/free-solid-svg-icons';
export default function Hamburger(props) {
  return (
    <div>
      <input type="checkbox" id="ham-menu" />
      <label htmlFor="ham-menu">
        <div className="hide-des">
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </div>
      </label>

      <div className="full-page-green"></div>

      <div className="ham-menu">
        <ul className="centre-text bold-text">
          <li className='user'>{props.name? props.name : 'user'}</li>
          <li >{props.name&& <button className="logout" onClick={() => { props.kc.logout({ redirectUri: 'http://localhost:3000/' }) }}><FontAwesomeIcon icon={faRightFromBracket} size="2x"/></button>}</li>
        </ul>
      </div>
    </div>
  );
}
