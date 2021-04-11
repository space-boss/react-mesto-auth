import React from 'react';
import { Route, Switch, useHistory, Redirect } from 'react-router-dom';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import { apiConfig } from '../utils/api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Register from './Register';
import { authApi} from '../utils/auth';


function App() {
  const [isEditProfilePopupOpen, toggleEditProfilePopup] = React.useState(false);
  const [isAddPlacePopupOpen, toggleAddPlacePopup] = React.useState(false);
  const [isEditAvatarPopupOpen, toggleEditAvatarPopup] = React.useState(false);
  const [isImagePopupOpen, toggleZoomImagePopup] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({name: '', link: ''});
  const [currentUser, setCurrentUser] = React.useState({avatar: '', name: '', about: ''});
  const [cards, setCards] = React.useState([]);
  const [isLoggedIn, setLoggedIn] = React.useState(false);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const history = useHistory();



  function handleRegistration(data) {
    authApi.registerUser(data.email, data.password)
    .then((res) => {
      if (res.ok) {
        setIsRegistered(true);
      } else {
        return {
          message: "Ой. Не получилось."
        };
      }
    }).catch((err) => console.log(err))
  }

  function redirectAfterAuth() {
    if (isRegistered) {
      history.push("/sign-in");
    }
  }

  function handleLogin(data) {
    authApi.authorizeUser(data.email, data.password)
    .then((data) => {
      console.log(data.token);
      if (data.token) {
        history.push("/main")
      }
    }).catch((err) => console.log(err));
    setLoggedIn(true);
    setEmail(data.email)
  }

  function tokenCheck() {
    const token = localStorage.getItem("token");
    if (token) {
      authApi.getUserData(token)
      .then((res) => {
        if (res) {
        setLoggedIn(true);
        setEmail(res.data.email);
        history.push("/main");
        }
      }).catch((err) => console.log(err))
    }
  }

  React.useEffect(() => {
    if (isLoggedIn) {
      history.push("/main");
    }
  }, [isLoggedIn, history]);


  React.useEffect(() => {
    apiConfig.getInfo()
    .then((res) => {
      setCurrentUser(res)
    })
    .catch((err) => {
      console.log(err);
    });
  }, []);


  React.useEffect(() => {
    apiConfig.getCard()
    .then((res) => {
      setCards(res);
    })
    .catch((err) => {
      console.log(err);
    });
  }, []);
  

  /*React.useEffect(() => {
    tokenCheck();
  }, []); */


  function handleAddPlaceSubmit(data) {
    apiConfig.postCard(data)
    .then((newCard) => {
      setCards([newCard, ...cards]);
      closeAllPopups();
    })
    .catch((err) => {
      console.log(err);
    });
  }
 
  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    if (!isLiked) {
      apiConfig.likeCard(card._id)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((err) => {
        console.log(err);
      });
    }
    else {
      apiConfig.unlikeCard(card._id)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }


  function handleCardDelete(card) {
    apiConfig.deleteCard(card._id)
    .then(() => {
      setCards(cards.filter((c) => c._id !== card._id));
    })
    .catch((err) => {
      console.log(err);
    });
  }


  function handleUpdateUser(user) {
    if (user.name !== '' && user.about !== '') {
      apiConfig.updateInfo(user)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }

  function handleUpdateAvatar(user) {
    if (user.avatar !== '') {
      apiConfig.updateAvatar(user)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });  
   }  
  }

  function handleEditAvatarClick() {
    toggleEditAvatarPopup(true);
  }

  function handleEditProfileClick() {
    toggleEditProfilePopup(true);
  }

  function handleAddPlaceClick() {
    toggleAddPlacePopup(true);
  }

  function closeAllPopups() {
    toggleAddPlacePopup(false);
    toggleEditAvatarPopup(false);
    toggleEditProfilePopup(false);
    toggleZoomImagePopup(false);
    setSelectedCard({name: '', link: ''});
  }

  function handleCardClick(card) {
    if (card.link !== '' && card.name !== '') {
      setSelectedCard({name: card.name, link: card.link});
      toggleZoomImagePopup(true);
    }
  }
  

  return (
  
    <CurrentUserContext.Provider value={currentUser}>
      <div className = "page">

        <Switch>
          <Route exact path="/">
            {isLoggedIn ? <Redirect to="/main" /> : <Redirect to="/signup" />}
          </Route>

          <Route path = "/sign-in">
            <Login   
              handleSubmit = {handleLogin}
              email = {email}
              isRegistered = {isRegistered}
              redirectAfterAuth = {redirectAfterAuth}
            />
          </Route>

          <Route path = "/sign-up">
            <Register
              handleSubmit = {handleRegistration}
              redirectAfterAuth = {redirectAfterAuth} />
          </Route>

          <ProtectedRoute 
            path="/main"
            isLoggedIn = {isLoggedIn}
            component = {Main}          
            onEditProfile = {handleEditProfileClick}
            onEditAvatar = {handleEditAvatarClick}
            onAddPlace = {handleAddPlaceClick}
            onCardClick = {handleCardClick}
            onCardLike = {handleCardLike}
            onCardDelete = {handleCardDelete}
            cards = {cards}
            email = {email}
          />

        </Switch>

        <Footer />

        <EditProfilePopup
          isOpen = {isEditProfilePopupOpen}
          onClose = {closeAllPopups}
          onUpdateUser = {handleUpdateUser}
        />

        <AddPlacePopup
          isOpen = {isAddPlacePopupOpen}
          onClose = {closeAllPopups}
          onAddPlace = {handleAddPlaceSubmit}
        />

        <EditAvatarPopup
          isOpen = {isEditAvatarPopupOpen}
          onClose = {closeAllPopups}
          onUpdateAvatar = {handleUpdateAvatar}      
        />  

        <PopupWithForm 
          name='delete-confirmation' 
          title='Вы уверены?'
          onClose = {closeAllPopups}> 
          <button type="button" className="popup__submit-button popup__submit-button_delete">Да</button>
        </PopupWithForm>

        <ImagePopup 
          isOpen  = {isImagePopupOpen}
          card    = {selectedCard}
          onClose = {closeAllPopups}
        />

      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;


