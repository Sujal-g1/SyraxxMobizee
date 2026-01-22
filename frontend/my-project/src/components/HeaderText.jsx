import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from 'framer-motion'

function HeaderText({ t }) {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    }).from(subtitleRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    }, "-=0.4"); // overlap for smooth effect
  }, []);

  return (
    <motion.div initial={{width:0}} animate={{width:"9vw"}} transition={{ duration:1.5,ease:[0.76, 0, 0.24, 1]}} >
      <h1 ref={titleRef} className="text-2xl font-bold">
        Mobizee
      </h1>

      <h1 ref={subtitleRef} className="text-3xl font-bold">
        {t("welcome")}
      </h1>
    </motion.div>
  );
}

export default HeaderText;
