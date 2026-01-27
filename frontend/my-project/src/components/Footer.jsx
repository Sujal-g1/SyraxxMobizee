 import algomaniaX from '../assets/bus2.svg'
 
 function Footer() {


    return (
        <footer className="w-full bg-gray-50 text-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6">
                   <div className="p-2 sm:p-3 rounded-2xl bg-white/40 shadow-lg">
                            <img
                              className="w-[50px] sm:w-[50px] md:w-[50px] lg:w-[50px] max-w-full"
                              src={algomaniaX}
                              alt="logo"
                            />
                          </div>

            <h1 onClick={()=> navigate("/Homepage")}
            className="text-xl md:text-2xl font-semibold tracking-wide">Mobizee</h1> 
                </div>
                
                <p className="text-center max-w-xl text-sm font-normal leading-relaxed">
                   Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam totam minima commodi ut illum optio! Veniam asperiores consectetur maxime temporibus.
                </p>
            </div>
            <div className="border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm font-normal">
                    <a href="https://prebuiltui.com">Mobizee</a> ©2026. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer ;