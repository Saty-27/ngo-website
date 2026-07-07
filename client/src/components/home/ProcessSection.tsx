import { useQuery } from "@tanstack/react-query";
import { ProcessSection as ProcessSectionType } from "@shared/schema";
import processDesktopImg from "@assets/process-desktop_1749457628105.png";
import processMobileImg from "@assets/process-mobile_1749457628106.png";

const ProcessSection = () => {
  const { data: section } = useQuery<ProcessSectionType>({
    queryKey: ["/api/process-section"],
  });

  const desktopImage = section?.desktopImageUrl || processDesktopImg;
  const mobileImage = section?.mobileImageUrl || processMobileImg;
  const title = section?.title || "ISKCON FOOD FOR CHILD";

  return (
    <section className="process-section">
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="process-title">{title}</h2>
        <div className="title-underline"></div>

        {/* Desktop Image */}
        <div className="process-image-container">
          <img
            src={desktopImage}
            alt="Process Steps Desktop"
            className="process-image desktop-image"
          />
          <img
            src={mobileImage}
            alt="Process Steps Mobile"
            className="process-image mobile-image"
          />
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;