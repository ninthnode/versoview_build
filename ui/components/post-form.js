import React, { useState } from "react";
import Image from "next/image";
import styles from "../styles/post-form.module.css";
import gallary from "../public/images/gallary.svg";
import padlock from "../public/images/padlockgrey.svg";
import menuicon from "../public/images/menu.svg";
import cameraIcon from "../public/images/camera-icon.svg";

const FormSection = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setsuccessMessage] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // const data = await loginApi(formData);

    // if (data.data && data.data.token) {
    //   setsuccessMessage(data.message);
    //   setTimeout(() => {
    //     window.location.replace("/choose-topics");
    //   }, 2000);
    // } else {
    //   setsuccessMessage("Invalid email or password");
    // }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return (
    <div className={styles.formContainer} >
      
      <form onSubmit={handleSubmit}>
        <div className={styles.parentDiv}>
          <div className={styles.childDiv_1}>
            <Image src={padlock} alt="padlock" className={styles.padlock} />
            <input
              className={styles.textarea3}
              type="text"
              placeholder="Home Beautiful Summer 2023 | July 1, 2023"
            />
            <div className={styles.heading}>
              <div className={styles.sectionDiv}>
                <span>SECTION</span>
                <input
                  type="text"
                  name="section"
                  placeholder="Entertaining"
                  onChange={handleChange}
                />
              </div>
              <div className={styles.sectionDiv}>
                <span>SUBSECTION(OPTIONAL)</span>
                <input
                  type="text"
                  name="subSection"
                  placeholder="Outdoor Living"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.sectionDiv}>
              <span className={styles.headStyle}>HEADER</span>
              <input
                className={styles.textarea1}
                type="text"
                name="header"
              placeholder="The Green Room"
                onChange={handleChange}
            />
            </div>


            <div className={styles.sectionDiv}>
              <span className={styles.headStyle}>STAND-FIRST</span>
              <input
                className={styles.textarea2}
                type="text"
                name="standFirst"
              placeholder="Nature's colour paiette helps lines thi spei magnim rehent hil e um rccestius at pliam outdoor space."
                onChange={handleChange}
            />
            </div>


            <div className={styles.sectionDiv}>
              <span className={styles.headStyle}>CREDITS</span>
              <input
                className={styles.textarea2}
                type="text"
                name="credits"
              placeholder="Suzy Tan & Hadaway Smythe"
                onChange={handleChange}
            />
            </div>


            <div className={styles.editFeature}>
              <p className={styles.pt}>π B I U $ TT tt Tt T¹ T1</p>
              <p className={`${styles.pt} ${styles.display}`}>
                <Image src={gallary} alt="gallaryicon" className={styles.img} />
                &nbsp;&nbsp;
                <Image src={menuicon} alt="menuicon" />
              </p>
            </div>
          </div>
          <div className={styles.childDiv_2}>
            <div className={styles.heading}>
              <p>MAIN IMAGE</p>
            </div>
            <div className={styles.displayBlock}>
              <div className={styles.cameraIcon}>
                
              </div>
              <label style={{ marginTop: 15, fontSize:18, fontFamily:'SF-Regular', display:'flex', flexDirection:'row', alignItems:'center' }}>
                <input type="radio" name="imageOption" className={styles.radioButton} checked/>
                <span style={{marginLeft:10}}>Upload image</span>
              </label>
              <label style={{fontSize:18, marginTop:15, fontFamily:'SF-Regular', display:'flex', flexDirection:'row', alignItems:'center'}}>
                <input type="radio" name="imageOption" className={styles.radioButton}/>
                <span style={{marginLeft:10}}>Use image from library</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className={styles.bodyContent}>
        <p className={styles.headStyle1}>BODY COPY</p>
        <div className={styles.bodyContent}>
          <div className={styles.bodyStyle}>
            <textarea className={styles.bodyContent} name="bodyRichText">
              The phenomenal nature of it all has to do with the recent
              appearance, all over the internet, of images of grungy apes with
              unimpressed expressions on their faces and human clothes on their
              sometimes-multicolored, sometimes-metal bodies. Most of the apes
              look like characters one might see in a comic about hipsters in
              Williamsburg — some are smoking and some have pizza hanging from
              their lips, while others don leather jackets, beanies, and grills.
              He’s also the only one in the group that wasn’t working a normal
              nine-to-five before the sudden tsunami of their current successes
              — and that’s because he’s never had a “real job. Not bad for a
              high school dropout,” he says through a smirk. Although Goner and
              his comrades’ aesthetic and rapport mirror that of a musical act
              freshly thrust into stardom, they’re actually the creators of Yuga
              Labs, a Web3 company.
            </textarea>
          <div className={styles.btnContainer}>
            <button className={styles.btn} type="submit">
              Save
            </button>
          </div>
        </div>
        </div>
        </div>
      </form>
    </div>
  );
};

export default FormSection;
