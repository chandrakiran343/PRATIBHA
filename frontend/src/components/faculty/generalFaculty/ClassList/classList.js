import React, { useEffect, useState } from "react";
import Navbar from "../../../global_ui/navbar/navbar";
import Card from "../../../global_ui/card/card.js";
import Button from "../../../global_ui/buttons/button";
import Dialog from "../../../global_ui/dialog/dialog";
import "./classList.css";
import { useNavigate } from "react-router-dom";
import { getEnrolledSubjects,deleteClass } from "../../services/enrollFacultyServices";
import { updateSubs } from "../../services/adminDeadlinesServices";
import { useAuth } from "../../../context/AuthContext";
import { LoadingScreen } from "../../../global_ui/spinner/spinner";
import { enrollCourse } from "../../../student/services/studentServices";

import { seeErrors } from "../../services/curriculumServices";

//the screen where faculty sees the list of all their classes in the form of cards. 
const ClassList = () => {
  const { currentUser } = useAuth();
  const [subs, setSubs] = useState();
  const [loading, setLoading] = useState(true);
  const[showDialog,setShowDialog]=useState(null);
  const[isConfirm,setConfirm]=useState(false);
  const navigate = useNavigate();


  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await getEnrolledSubjects(currentUser.email);
 
        if (res === -1) {
          //display error
        } else {
          setSubs(res);
          setLoading(false);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchSubjects();
  }, [currentUser.email,subs]);

  function handleCard(sub) {
    // errorSubs()
    if (subs.praSetSubs[sub]) {
      navigate("/faculty/studentlist", { state: { sub: sub } });
    } else {
      navigate("/faculty/createPRA", { state: { sub: sub } });
    }
  }

   // use this function to update the subjects curriculum collection
   async function up(){
    const set1 = [{"subject":"Mathematics2"}, {"subject":"Engineering Chemistry"}, {"subject":"Python Programming"},{"subject":"Basic Electrical Engineering"}];
    const set2 = [{"subject":"Mathematics2"}, {"subject":"Applied Chemistry"}, {"subject":"English"},{"subject":"Python Programming"}];
    //parameters: course, year, department, updation array, semester number  
    await updateSubs("BTech",2,"CSB",set2,2);
  }
  // up()
  const [delSub, setdelSub] = useState(null);
 async function handledelete(sub){
    setdelSub(sub);

    setShowDialog("Are you sure you want to delete class ? All the data will be lost forever.")
  }

  async function errorSubs() { // This function triggers when a card in classlist is clicked. Function Called in line no. 45
    const data = await seeErrors();

    const sem2students = [] // Array of students who have enrolled in semester 2

    data.forEach(e => { // checking the students Semester number.
      if (e.data()["semester"] !== 1)
        sem2students.push([e.data(), e.id]) // pushing student data and id to the array
     
    })
    const faultystudents = [] // Array for students with faulty subjects
    sem2students.forEach(e => { 
      if (e[0].subjects[0].subject !== "Mathematics2") {
        faultystudents.push(e)
      }
    })
    console.log(faultystudents)

    const DeptFilteredStudents = faultystudents.filter(e => { return e[0].department === "ME" ? e: null }) // filtering faulty students according to department
    console.log(DeptFilteredStudents)

    const set1 = [{"subject":"Mathematics2"}, {"subject":"Engineering Chemistry"}, {"subject":"Python Programming"},{"subject":"Basic Electrical Engineering"}];
    const set2 = [{"subject":"Mathematics2"}, {"subject":"Applied Chemistry"},{"subject":"English"},{"subject":"Python Programming"} ];
    const set3 = [{"subject":"Mathematics2"}, {"subject":"Applied Physics"}, {"subject":"English"}, {"subject":"Python Programming"}];


    DeptFilteredStudents.forEach(e => {
      enrollCourse(
        e[1], {
        name: e[0].name,
        course: e[0].course,
        year: e[0].year,
       // regulation: e[0].regulation,
        department: e[0].department,
        subjects: set2, // change the set according to what the Dept has in its curriculum
        section: e[0].section,
        semester: 2 // used the semester number here manually
      }
      )
      console.log(`done ${e[0].name}`);
    })
  }

  
  return loading ? (
    <LoadingScreen />
  ) : (
    <div>
      <Navbar back={false} title="Your Classes" logout={true} />
      
      <div className="div-container-classes">
      <div className="addclass-button btn-container">
      {   
        showDialog && 
        <Dialog twoButtons={true} message={showDialog} 
          onConfirm={
            async()=>{
              setLoading(true);
              const d = await deleteClass(currentUser.email,delSub);
              if(d){
                setLoading(false);
              }
              setLoading(false);
              setConfirm(true);
              setShowDialog(false)
            }
          } 
        onCancel={()=>setShowDialog(false)}/>
      }

      <Button className="addclass-button normal" onClick={()=>{navigate("/faculty/addclasses")}}><i class="fas fa-plus"></i>Add Classes</Button>
      {currentUser.isHOD?<Button className="viewdept-button normal" onClick={()=>{navigate("/faculty/HODSearch")}}>View Department Grades</Button>:<p></p>}
      </div>
        {subs.btechSubs.length !== 0 && (
          <div className="subjectsDivision">
            <h4 className="courseTitle">B.Tech</h4>
            <div className="cardList">
              {subs.btechSubs.map((item) => {
                var displayItem = item.split("_");
                displayItem.splice(0, 1);
                let newItem = displayItem[1];
                let len = displayItem.length;
                for (let i = 2; i < len; i++) {
                  newItem = newItem + "-" + displayItem[i];
                }
                return (
                  <Card
                  children={<i class="fas fa-trash-alt"></i>}
                  onClickchildren={handledelete}
                    key={newItem}
                    onclick={handleCard}
                    text={newItem}
                    subText={
                      subs.praSetSubs[item]
                        ? subs.praSetSubs[item].date2
                          ? `MID 2 Deadline: ${subs.praSetSubs[item].date2}`
                          : `MID 1 Deadline: ${subs.praSetSubs[item].date1}`
                        : "PRA not created."
                    }
                    klass={item}
                  />
                );
              })}
            </div>
          </div>
        )}
        {subs.mtechSubs.length !== 0 && (
          <div className="subjectsDivision">
            <h4 className="courseTitle"> M.Tech</h4>
            <div className="cardList">
              {subs.mtechSubs.map((item) => {
                var displayItem = item.split("_");
                displayItem.splice(0, 1);
                let newItem = displayItem[1];
                let len = displayItem.length;
                for (let i = 2; i < len; i++) {
                  newItem = newItem + "-" + displayItem[i];
                }
                return (
                  <Card
                    children={<i class="fas fa-trash-alt"></i>}
                  onClickchildren={handledelete}
                    key={newItem}
                    onclick={handleCard}
                    text={newItem}
                    subText={
                      subs.praSetSubs[item]
                        ? subs.praSetSubs[item].date2
                          ? `MID 2 Deadline: ${subs.praSetSubs[item].date2}`
                          : `MID 1 Deadline: ${subs.praSetSubs[item].date1}`
                        : "PRA not created."
                    }
                    klass={item}
                  />
                );
              })}
            </div>
          </div>
        )}
        {subs.mbaSubs.length !== 0 && (
          <div className="subjectsDivision">
            <h4 className="courseTitle">MBA</h4>
            <div className="cardList">
              {subs.mbaSubs.map((item) => {
                var displayItem = item.split("_");
                displayItem.splice(0, 1);
                let newItem = displayItem[1];
                let len = displayItem.length;
                if (displayItem[1] === "1")
                  newItem =
                    newItem + "-" + displayItem[3] + "-" + displayItem[4];
                else {
                  for (let i = 2; i < len; i++) {
                    newItem = newItem + "-" + displayItem[i];
                  }
                }
                return (
                  <Card
                    children={<i class="fas fa-trash-alt"></i>}
                  onClickchildren={handledelete}
                    key={newItem}
                    onclick={handleCard}
                    text={newItem}
                    subText={
                      subs.praSetSubs[item]
                        ? subs.praSetSubs[item].date2
                          ? `MID 2 Deadline: ${subs.praSetSubs[item].date2}`
                          : ` MID 1 Deadline: ${subs.praSetSubs[item].date1}`
                        : "PRA not created."
                    }
                    klass={item}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassList;

// const BTechClasses = [
//   "2_CSM_B_Software Engineering",
//   "3_CSB_A_Compiler Design",
//   "2_CE_A_Engineering Mechanics",
// ];
// const MBAClasses = ["2_Engineering Mechanics"];
// const MTechClasses = [
//   "2_CE_A_Engineering Mechanics",
//   "1_CSE_A_Engineering Mechanics",
// ];
