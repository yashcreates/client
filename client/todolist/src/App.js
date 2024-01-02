import React, { useState, useEffect,useRef } from 'react';
//import '../public/styles.css';
import { useUser } from './UserContext';
import { library } from '@fortawesome/fontawesome-svg-core';


import "primereact/resources/themes/lara-light-indigo/theme.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareMinus } from '@fortawesome/free-regular-svg-icons';

import { faEraser,faCheck } from '@fortawesome/free-solid-svg-icons';
import "primereact/resources/primereact.min.css";
import '/node_modules/primeflex/primeflex.css'
import { httpClient } from './HttpClient';
import Cards from './Cards';
import Hamburger from './Hamburger';
import Keycloak from 'keycloak-js';
import "./styles.css"
import axios from 'axios';
import StripeCheckout from 'react-stripe-checkout';
import { useLocation,useNavigate} from 'react-router-dom';
library.add(faSquareMinus,faEraser,faCheck);

let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'master',
  clientId: 'react-client',
}

let kc = new Keycloak(initOptions);

kc.init({
  onLoad: 'login-required',
  checkLoginIframe: true,
  pkceMethod: 'S256'
}).then((auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    console.info("Authenticated");
    console.log('auth', auth)
    console.log('Keycloak', kc)
    console.log('Access Token', kc.token)

    httpClient.defaults.headers.common['Authorization'] = `Bearer ${kc.token}`;

    kc.onTokenExpired = () => {
      console.log('token expired')
    }
  }
}, () => {
  console.error("Authentication Failed");
});

function App(props) {
  const [usern, setusern] = useState();
  const [InfoMessage, setInfoMessage] = useState();
  const [added, setadded] = useState(false);

  const [premium, setpremium] = useState(false);
  const [userid, setuserid] = useState("");
  const [work, setwork] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handlepremium = async () => {
    console.log("email:",userid)
    try {
      const response = await fetch(`/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
          mutation {
            updatepremium(userId:"${userid}") {
              success
              user{
                id
                name
                premium
              }
            }
          }
          `,
        }),
      });
  
      const result = await response.json();
      console.log("premium",result)
      if(result.data.updatepremium.premium=="true"){
        setpremium(true)}
      else{
        setpremium(false)
      }
  
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };
  



      
  
  const orderCoffee = () => {
    fetch(`/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            works {
              success
              errors
              works {
                id
                name
                user{
                  id
                  name
                  premium
                }
              }
            }
          }
        `,
      }),
    })
      .then(res => res.json())
      .then(res => {
        const works = res.data?.works?.works || [];
        setInfoMessage(works);
        console.log("w",works);
        console.log("klll",userid)
        const userworks =works.filter(wrk => wrk.user.id===userid);

        console.log("user",userworks);
  
       
     
        setwork(userworks);
    
        console.log('Filtered User Todos:', userworks);
        console.log('Unique Work Types:',works);
        
      })
      .catch(console.error);
  };

  const createNewUser = async () => {
    
    try {
      // Wait for kc.idTokenParsed to be available
      while (!kc.idTokenParsed) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add a short delay
      }
      console.log("hyyy",kc.idTokenParsed)
      const response = await fetch(`/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${kc.token}`, // Include the authorization token
        },
        body: JSON.stringify({
          query: `
            mutation adduser{
              createUser(
                id:"${kc.idTokenParsed.email}"
                name:"${kc.idTokenParsed.preferred_username}",
                email:"${kc.idTokenParsed.email}",
                password:"${kc.idTokenParsed.to_hash}",
              ) {
                success
                errors
                user {
                  id
                  name
                  email
                  premium
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();
      console.log("Response from server:", result);
      
      if (result.data && result.data.createUser && result.data.createUser.user) {
        const user = result.data.createUser.user;
        console.log("User data:", user);
      
        // Make sure that user["name"] and user.id are valid before updating state
        if (user["name"] && user.id) {
          console.log("Setting user data in state...");
          setusern(user["name"]);
          setuserid(user.id);
          console.log("ppppppp",premium)
          console.log("sssss",user.premium)
          if(user.premium=="true"){
            setpremium(true)}
          else{
            setpremium(false)
          }
          console.log("User name and ID set successfully.",userid);
        } else {
          console.error("Invalid user data received:", user);
        }
      } else {
        console.error("Invalid response structure:", result);
      }
      
       
    
    } catch (error) {
      console.error("Error creating user:", error);
      setInfoMessage("Error creating user. Please check the console for details.");
    }
  };

  useEffect(() => {
  createNewUser();

  
  }, []);

  useEffect(() => {
    orderCoffee();
  
    
    }, [userid]);
  


 

    const handleCheckout = async () => {
      try {
        const requestBody = {
          userId: userid,
        };
        const response = await fetch('/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
    
        const responseData = await response.json();
        console.log(responseData);
    
        console.log(responseData.checkoutSessionUrl);
        window.location.href = responseData.checkoutSessionUrl;
    
        // If you want to redirect to the Stripe checkout page, you can use:
        // window.location.href = responseData.checkoutSessionUrl;
    
      } catch (error) {
        console.error('Error creating checkout session:', error);
      }
    };
  


  


  return (
    <div className="App">
        {premium? <button className='checkout' disabled='true'> Premium</button>:
             <button className="checkout" onClick={handleCheckout}>
              checkout
            </button>}
          <Hamburger name={usern} kc={kc}/>
          <Cards works={work} p={premium}  setdded={added} setadded={setadded} setwork={setwork} userId={userid}/>
        
    
          
          
    </div>
  );
}

export default App;
