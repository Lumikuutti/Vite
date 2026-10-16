import { fetchData } from './functions';
import type { UpdateResult } from './interfaces/UpdateResult';
import type { UploadResult } from './interfaces/UploadResult';
import type { LoginUser, UpdateUser, User } from './interfaces/User';
import { apiUrl, uploadUrl } from './variables';

// PWA code

// select forms from the DOM
const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM
const usernameInput = document.querySelector('#username') as HTMLInputElement | null;
const passwordInput = document.querySelector('#password') as HTMLInputElement | null;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement | null;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement | null;

// unused
// const avatarInput = document.querySelector('#avatar') as HTMLInputElement | null;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector('#avatar-target') as HTMLImageElement | null;

if (!usernameTarget || !emailTarget || !avatarTarget) {
  throw new Error('Targets missing.');
}

if (!profileEmailInput || !profileUsernameInput) {
  throw new Error('Input elements missing.');
}

if (!loginForm || !profileForm || !avatarForm) {
  throw new Error('Form elements missing.');
}

// TODO: function to login
const login = async (): Promise<LoginUser> => {
  const credentials = {
    username: usernameInput?.value,
    password: passwordInput?.value
  }

  const loginOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  };
  return await fetchData(apiUrl + '/auth/login', loginOptions);
};

// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  const updateOptions: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(user),
  };
  return await fetchData(apiUrl + '/users', updateOptions);
};

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  avatarTarget.src = uploadUrl + user.avatar;
  emailTarget.textContent = user.email;
  usernameTarget.textContent = user.username;
  profileEmailInput.value = user.email;
  profileUsernameInput.value = user.username;
  console.log(user.favouriteRestaurant);
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const udataOptions: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await fetchData(apiUrl + '/users/token', udataOptions);
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  try {
    const userData = await getUserData(token);
    addUserDataToDom(userData);
  } catch (error) {
    alert((error as Error).message);
  }
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data

loginForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const user = await login();
  console.log(user);
  localStorage.setItem('token', user.token);
  addUserDataToDom(user.data);
});

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken

profileForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const user: UpdateUser = {
    username: profileUsernameInput.value,
    email: profileEmailInput.value,
  };
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Login first');
    return;
  }
  const updateResult = await updateUserData(user, token);
  console.log(updateResult);
  addUserDataToDom(updateResult.data);
});

// TODO: avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken

avatarForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const token = localStorage.getItem('token');
  if (!(avatarForm instanceof HTMLFormElement) || !token) {
    return;
  }
  const formData = new FormData(avatarForm);
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    body: formData,
  };
  const avatarResult = await fetchData<UploadResult>(
    apiUrl + '/users/avatar',
    options
  );
  const updateResult = await updateUserData(
    { avatar: avatarResult.data.avatar },
    token
  );
  addUserDataToDom(updateResult.data);
});
