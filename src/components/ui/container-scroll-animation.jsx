import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export function ContainerScroll({
  titleComponent,
  children,
  className = "",
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.85, 0.95] : [1.02, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.6], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.6], [40, -10]);

  return (
    <div
      className={`container-scroll-outer ${className}`}
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: isMobile ? "20px 8px" : "40px 16px",
      }}
    >
      <div
        className="container-scroll-inner"
        style={{
          width: "100%",
          position: "relative",
          perspective: "1200px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Header({ translate, titleComponent }) {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="container-scroll-header"
    >
      {titleComponent}
    </motion.div>
  );
}

function Card({ rotate, scale, children }) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 10px 30px -10px #0000004d, 0 20px 50px -15px #15233e26, 0 0 0 1px #d7dee8",
      }}
      className="container-scroll-card"
    >
      <div className="container-scroll-bezel">
        <div className="container-scroll-camera" />
      </div>
      <div className="container-scroll-screen">
        {children}
      </div>
    </motion.div>
  );
}
