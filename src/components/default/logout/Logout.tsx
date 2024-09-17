'use client'

import { BiLogOutCircle } from "react-icons/bi"; 
import "./style.scss";
import { useAuth } from "@/guards/auth.guard";

const Logout = () => {
    const {logout}=useAuth();
  return (
    <section id='logout'>
     <button onClick={()=>logout()}>
        <BiLogOutCircle /> Logout
     </button>
    </section>
  )
}

export default Logout
