import firebase from 'firebase';

// var firebaseConfig = {
//     apiKey: "AIzaSyANZi6Xc7B1_14-RfEJ7KV9b9nkcZL2DqY",
//     authDomain: "quizdom-70da5.firebaseapp.com",
//     projectId: "quizdom-70da5",
//     storageBucket: "quizdom-70da5.appspot.com",
//     messagingSenderId: "706147557425",
//     appId: "1:706147557425:web:40f7062e5aee9a84743510",
//     measurementId: "G-RE88729T4B"
//   };

const firebaseConfig = {
  apiKey: "AIzaSyBoWLYrLRwYfdk7-LSgNAcbLtDtG3gj0kQ",
  authDomain: "quiz-1db0c.firebaseapp.com",
  projectId: "quiz-1db0c",
  storageBucket: "quiz-1db0c.appspot.com",
  messagingSenderId: "78963595474",
  appId: "1:78963595474:web:8d9d4f5b4ed293f52b350b"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
firebase.auth()

export default firebase;