import React, {useState, useEffect} from "react";
import img1 from "../assets/img1.jpg";
// import { appointments } from "./data/ListOfAppointment";
// import { useNavigate, Navigate } from "react-router-dom";
import accountRole from '../data/account.json';



const NotificationList = () => {
    const [role, setRole] = useState(null);
    const [message, setMessage] = useState('');

    

    useEffect(() => {
        const currentUser = accountRole.user[1];
        setRole(currentUser.role);

        switch (currentUser.role) {
            case 'manager':
                setMessage('Welcome, Manager!');
                break;
            
            case 'student':
                setMessage('Welcome, Student!');
                break;
            
            case 'parent':
                setMessage('Welcome, Parent!');
                break;      
            
            case 'psychologist':
                setMessage('Welcome, Psychologist!');
                break;     
        
            default:
                break;
        }
    }, []);


    return (
        <div className="flex flex-col text-xs text-black rounded-lg bg-white border-[1px]   ">
            <h1 className="justify-start text-xl font-bold my-2 pl-2">Notification</h1>
            <div className="px-2 mb-4 flex flex-wrap">
                <div className="bg-[#ebf5ff] px-[12px] py-[6px] rounded-3xl hover:bg-[#DFE9F2] cursor-pointer"
                                >
                    <span className="text-[#1A6FCB] font-semibold  ">
                        All
                    </span>

                </div>
                <div className="hover:bg-[#DFE9F2] px-[12px] py-[6px] rounded-3xl ml-2 cursor-pointer"
                                >
                    <span className=" font-medium ">
                        Unread
                    </span>
                    
                </div>
            </div>

            <div>
                <div className="px-1">
                    <div  
                        className="grid grid-cols-12 items-center p-2 hover:bg-[#F2F2F2] cursor-pointer"
                                  >                 
                    
                        <img src={img1} alt="profile" className="w-16 h-16 rounded-full object-cover col-span-3" />
                        <div className="col-span-9 flex flex-col">
                            <span>{role === 'student' && <span>{message}</span>}</span>
                            <span>3 day</span>
                        </div>
                    </div>
                    
                </div>

                <div className="px-1">
                    <div className="grid grid-cols-12 items-center p-2 hover:bg-[#F2F2F2] cursor-pointer"
                                >
                        <img src={img1} alt="profile" className="w-16 h-16 rounded-full object-cover col-span-3" />
                        <div className="col-span-9 flex flex-col">
                            {role === 'student' && <span>{message}</span>}
                            <span>3 day</span>
                        </div>
                    </div>
                    
                </div>

                <div className="px-1">
                    <div className="grid grid-cols-12 items-center p-2 hover:bg-[#F2F2F2] cursor-pointer">
                        <img src={img1} alt="profile" className="w-16 h-16 rounded-full object-cover col-span-3" />
                        <div className="col-span-9 flex flex-col">
                            <span>{role === 'student' && <span>{message}</span>}</span>
                            <span>3 day</span>
                        </div>
                    </div>
                    
                </div>

                <div className="px-1">
                    <div className="grid grid-cols-12 items-center p-2 hover:bg-[#F2F2F2] cursor-pointer">
                        <img src={img1} alt="profile" className="w-16 h-16 rounded-full object-cover col-span-3" />
                        <div className="col-span-9 flex flex-col">
                            <span>{role === 'student' && <span>{message}</span>}</span>
                            <span>3 day</span>
                        </div>
                    </div>
                    
                </div>

                <div className="px-1 py-1 m-5 bg-[#e2e5e9] rounded-md hover:bg-[#D6D9DD] cursor-pointer "
                    >
                    <div className="flex justify-center items-center">
                        <span className="font-semibold">View previous Notifications</span>
                    </div>
                    
                </div>
            </div>
        </div>



        
    )
}

export default NotificationList;