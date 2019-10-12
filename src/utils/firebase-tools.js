import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";

import { FIREBASE_CONFIG } from "../constants";

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);

import prettierBytes from "prettier-bytes";

/*
const firebase={
	setPersistence(){return this},
	signOut(){return this},
	auth(){return this},
	signInWithCustomToken(){return ""},
	storage(){return this},
	ref(){return this},
	child(){return this},
	put(){return this},
	on(event,fnc1,fnc2,fnc3){
		if(event==="state_changed"){
			setTimeout(()=>fnc1({bytesTransferred:0,totalBytes:100,state:1}),500);
			setTimeout(()=>fnc1({bytesTransferred:30,totalBytes:100,state:1}),1000);
			setTimeout(()=>fnc1({bytesTransferred:60,totalBytes:100,state:1}),1500);
			setTimeout(()=>fnc1({bytesTransferred:100,totalBytes:100,state:1}),2000);
			setTimeout(()=>fnc3({}),2500);
		}
	}
}
firebase.storage.TaskState={PAUSED:0,RUNNING:1};
firebase.auth.Auth={Persistence:{NONE:0}};
*/

export { firebase, prettierBytes };
