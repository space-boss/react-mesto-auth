import React from 'react';
import Success from '../images/registration-ok.svg';
import Fail from '../images/registration-fail.svg';


function InfoTooltip(props) {
  const popupOpenedClass = props.isOpen ? "popup_opened" : '';

  return (
    <div className={`popup popup_infotooltip ${popupOpenedClass}`}>
        <div className={`popup__container popup__container-auth-feedback`}>
          <button type="button"
          onClick={props.onClose} 
          className="popup__close" 
          aria-label="Закрыть форму" />

          <img 
          className="popup__img-auth-feedback"
          src={props.responseCode === 201 ? Success : Fail}
          alt ='Статус авторизации'/>

          <h3 className="popup__title popup__title_centered">
            {props.divresponseCode === 201
            ? 'Вы успешно зарегистрировались!'
            : 'Что-то пошло не так! Попробуйте ещё раз.'}</h3>
        </div>
    </div>
  )
}

export default InfoTooltip;