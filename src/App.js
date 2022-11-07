import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeo2exToyRiQsWES9sP9YZtivjzaRtv1w",
  authDomain: "formik-hook-44175.firebaseapp.com",
  projectId: "formik-hook-44175",
  storageBucket: "formik-hook-44175.appspot.com",
  messagingSenderId: "1088984143689",
  appId: "1:1088984143689:web:6ff6ddcae7500df22a2c98",
  measurementId: "G-E9TCMP0SDG"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

function App() {

  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  // const [isEditing,setIsEditing]=useState(null);
  // const [editingText,isEditingText]=useState("");
  
  const[editing,setEditing]=useState({

    editingId:null,
    editingText:""

  })


  const formik = useFormik({
    initialValues: {
      text: "",
      title: "",
    },
    validationSchema:yup.object({
      title: yup
        .string('Enter title')
        .required('Title is required'),
      
        password: yup
        .string('Enter your password')
        .min(8, 'Password should be of minimum 8 characters length')
        .required('Password is required'),
    });,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });


  useEffect(() => {

    let unsubscribe = null;
    const getRealtimeData = async () => {
      const q = query(collection(db, "posts"), orderBy("createdOn", "desc"));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const posts = [];
        querySnapshot.forEach((doc) => {
          // posts.push(doc.data());
          let data = doc.data();
          data.id = doc.id;

          posts.push(data);
        });
        setPosts(posts);

        console.log("Posts: ", posts);
      });

      return () => {
        unsubscribe();
      };
    };

    getRealtimeData();
  }, []);

  const savePost = async (e) => {
    // axios.get("");
    e.preventDefault();
    console.log("Post text", postText);

    try {
      const docRef = await addDoc(collection(db, "posts"), {
        text: postText,
        createdOn: serverTimestamp(),
      });
      setPostText("");
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deletePosts = async (postId) => {
    // console.log("post Id: ",postId);
    await deleteDoc(doc(db, "posts", postId));

  };

  const updatePost = async (e) => {
   
    // Set the "capital" field of the city 'DC'
    e.preventDefault();

    await updateDoc(doc(db, "posts", editing.editingId), {
      text: editing.editingText,
    });

    setEditing({
        editingId:null,
        editingText:""
    })

  };

  // const edit = (postId,Text)=>{

    // setIsEditing(postId)
    // setEditingText(Text)



    // const updatedState = posts.map((eachItem) => {
    //   if (eachItem.id === postId) {
    //     return { ...eachItem, isEditing: !eachItem.isEditing };
    //   } else {
    //     return eachItem;
    //   }
    // });

    // setPosts(updatedState);

  // }


  return (
    <div className="App">
      <form onSubmit={savePost}>
        <div className="wrap">
          <div className="search">
            <input
              id="cityName"
              value={postText}
              onChange={(e) => {
                setPostText(e.target.value);
              }}
              type="text"
              className="searchTerm"
              placeholder="What's in your mind..?"
            />
            <button type="submit" className="searchButton">
              Post
            </button>
          </div>
        </div>
      </form>

      <div className="allPosts">
        {posts.map((eachPost, i) => (
          <div className="post" key={i}>
            <h1>
              {(eachPost.id===editing.editingId)?
              <form onSubmit={updatePost}>
              <input 
              type="text" 
              value={editing.editingText}
              onChange={(e)=>{

                setEditing({...editing, editingText:e.target.value})
              }}
              placeholder="Enter updated text" /> 
              
              <button>Update</button>

              </form>
              : 
              eachPost?.text
              }
            </h1>

            <span>
              {moment(
                eachPost?.createdOn?.seconds
                  ? eachPost?.createdOn?.seconds * 1000
                  : undefined
              ).format("MMMM Do YYYY, h:mm a")}
            </span>
            <br />
            <button
              className="del"
              onClick={() => {
                deletePosts(eachPost?.id);
              }}
            >
              Delete
            </button>
            
          { (editing.editingId===eachPost?.id)? "" 
            :
            <button
              className="btn-read"
              onClick={() => {

                // edit(eachPost?.id,eachPost?.text);
              
                          
                setEditing({

                // ...editing,
                editingId:eachPost?.id,
                editingText:eachPost?.text

              })

              }}
            >
              Edit
            </button>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
