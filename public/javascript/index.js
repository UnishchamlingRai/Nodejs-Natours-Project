//(Login)
const login = async (email, password) => {
  try {
    const data = {
      email: email,
      password: password,
    };
    const url = 'http://127.0.0.1:3000/api/v1/users/login';
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response.status === 'Success') {
      showAlert('success', 'Login in Successfully');
      setTimeout(() => {
        window.location.assign('/');
      }, 1000);
    } else {
      showAlert('error', response.message);
    }
  } catch (error) {
    showAlert('error', error.response.message);
  }
};

//To current user logout
const logOut = async () => {
  let response = await fetch('http://127.0.0.1:3000/api/v1/users/logOut');
  response = await response.json();
  try {
    if (response.status === 'success') {
      showAlert('success', 'Logout Successfully');

      if (window.location.pathname === '/me') {
        window.location.assign('/');
      } else {
        window.location.reload(true);
      }
    }
  } catch (error) {
    showAlert('error', 'logout Error please Login Again!');
  }
};

//update user data
const updateUserData = async (name, email) => {
  try {
    const data = {
      name: name,
      email: email,
    };
    let response = await fetch('http://127.0.0.1:3000/api/v1/users/updateMe', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log('Reponse DAta:', response);
    response = await response.json();
    console.log('Reponse DAta:', response);
    if (response.status === 'success') {
      showAlert('success', 'User Data Update Successfully');
      window.location.reload(true);
    } else {
      showAlert('error', response.message);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.message);
  }
};

///update User password
const updateUserPassword = async (
  currentPassword,
  password,
  passwordConfirm
) => {
  try {
    const data = {
      currentPassword: currentPassword,
      password: password,
      passwordConfirm: passwordConfirm,
    };
    let response = await fetch(
      'http://127.0.0.1:3000/api/v1/users/updateMyPassword',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    response = await response.json();
    if (response.status === 'Success') {
      showAlert('success', 'User Password Update Successfully');
      // window.location.reload(true);
    } else {
      console.log('error:', response);
      showAlert('error', response.message);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error); //test1234
  }
};

// To recevie the data
const selectForm = document.querySelector('#form');
const selectLouOut = document.querySelector('.nav__el--logout');
const selectUpdateUserForm = document.querySelector('#updateUserForm');
const selectUpdatePassword = document.querySelector('#updatePassword');

//to get inputed data when user login
if (selectForm) {
  selectForm.addEventListener('submit', (event) => {
    // console.log('hello form gaihtj');
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

//to call logout functon
if (selectLouOut) {
  selectLouOut.addEventListener('click', () => {
    logOut();
  });
}
if (selectUpdateUserForm) {
  selectUpdateUserForm.addEventListener('submit', (event) => {
    console.log('hello form gaihtj');
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    console.log('Eamail an name:', name, email);
    updateUserData(name, email);
  });
}

//to get inputed data when user Update Password
if (selectUpdatePassword) {
  selectUpdatePassword.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.getElementById('savePassword').textContent = 'Udating....';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserPassword(currentPassword, password, passwordConfirm);
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.getElementById('savePassword').textContent = 'Save Password';
  });
}

//To hide the Alerted Error
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
