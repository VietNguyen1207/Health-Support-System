import React, { useState } from 'react';
import bellImage from '../assets/4fcd9fb3-365f-47e5-8933-8e3ad028c106.jpg';
import bellImage1 from '../assets/8cd00e75-d981-4e4f-bc0c-cdf9128a8893.jpg';
import NotificationList from './NotificationList';



const NotificationBell = () => {

    const [isActive, setActive] = useState(false);
    
    
    const handleBellClick = () => {
        
            setActive(!isActive);
        
    }
    let img = isActive ? bellImage1 : bellImage;

    return (    
        <div className='relative'>
            <span className='h-full flex items-center justify-center'>
                <div 
                    className={`rounded-full border-[10px] text-[12px] flex justify-center items-center cursor-pointer 
                    transition-all duration-300 ${isActive ? 
                        'border-[#EAF5FF] bg-[#EAF5FF] hover:border-[#DDE7F0] hover:bg-[#DDE7F0]' 
                        : 
                        'border-[#E5E7EB] bg-[#E5E7EB] hover:border-[#D6D9DD] hover:bg-[#D6D9DD]'
                    }`}
                    onClick={handleBellClick}
                >     
                    <img className='w-[20px] h-[20px] text-[12px] rounded-full ' 
                    src={img} 
                    alt="bellOrigin"/>
                </div>        
            </span>

            {isActive && (            
                <div className="absolute top-16  transform translate-x-[-120px]  w-[320px]">
                <NotificationList />
            </div>
                
            )}
        </div>
    
    )
}




export default NotificationBell;