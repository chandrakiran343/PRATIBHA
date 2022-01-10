import React, { useState, useEffect } from "react";
import Navbar from "../../global_ui/navbar/navbar";
import EditIcon from "@mui/icons-material/Edit";
import { Spinner } from "../../global_ui/spinner/spinner";
import { db } from "../../../firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { getStudentData } from "../services/studentServices";
import { useAuth } from "./../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingScreen } from "../../global_ui/spinner/spinner";
import Card_ from "../../global_ui/card/card_";
import "./SubjectlistStyles.css";
import Dialog from "../../global_ui/dialog/dialog";

const SubjectsList = () => {
  const [data, setData] = useState([]);
  const [showDialog, setShowDialog] = useState(null);

  const location = useLocation();
  let navigate = useNavigate();

  const [loading, setloading] = useState(true);
  const [error, setError] = useState(null);
  const [userDoc, setuserDoc] = useState(null);
  const [courseTitle, setCourseTitle] = useState(" ");
  const [course, setcourse] = useState("");
  const [year, setyear] = useState("");

  const { currentUser } = useAuth();

  const fetchDeadline = async () => {
    const adminRef = doc(db, "adminData", "coeDeadline");
    const adminDoc = await getDoc(adminRef);
    if (adminDoc.exists()) {
      let date = new Timestamp(
        adminDoc.data()["coeDeadline"]["seconds"],
        adminDoc.data()["coeDeadline"]["nanoseconds"]
      ).toDate();
      return date;
    }
  };

  const fetchdata = async () => {
    const { document, error } = await getStudentData(`${currentUser.email}`);
    if (error == null) {
      setuserDoc(document);
      setcourse(document.course);
      setyear(document.year);
      let course =
        document.course +
        "_" +
        document.year +
        "_" +
        document.department +
        "_" +
        document.section;
      setCourseTitle(course);

      let coedeadLine = await fetchDeadline();

      await fetchsubject(document, coedeadLine, course);
    } else {
      setError(error);
    }
    setloading(false);
  };

  const fetchsubject = async (document, coedeadLine, course) => {
    let deadline, mid;
    let date, dateConv;
    const subjectRef = doc(db, "subjects", course);
    await getDoc(subjectRef).then(async (subjectDoc) => {
      if (subjectDoc.exists()) {
        const res = subjectDoc.data()["subjects"];
        await res.map(async (item, index) => {
          let date1 = new Timestamp(
            item["deadline1"].seconds,
            item["deadline1"].nanoseconds
          ).toDate();
          let newDate = new Date();
          let currentDate = newDate.toLocaleDateString("en-GB");
          let currentDateConv = newDate.toLocaleDateString("en-US");

          if (coedeadLine > date1) {
            console.log("1");
            mid = 1;

            date = date1.toLocaleDateString("en-GB");
            dateConv = date1.toLocaleDateString("en-US");
          } else {
            mid = 2;
            if (item["deadline2"]) {
              let date2 = new Timestamp(
                item["deadline2"].seconds,
                item["deadline2"].nanoseconds
              ).toDate();
              date = date2.toLocaleDateString("en-GB");
              dateConv = date2.toLocaleDateString("en-US");
            }
          }

          // console.log(date);
          // console.log(currentDate);

          var dateint = new Date(dateConv).getTime();
          var currdate = new Date(currentDateConv).getTime();
          // console.log(dateint);
          // console.log(currdate);

          var Difference_In_Time = dateint - currdate;
          var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
          // console.log(Difference_In_Days);
          var isWeek = false;
          if (Difference_In_Days <= 7) {
            isWeek = true;
          }

          // let  date = new Timestamp(deadline.seconds,deadline.nanoseconds).toDate();
          //   let date = new Date(seconds * 1000);
          //   deadline =
          //     date.getDate().toString() +
          //     "-" +
          //     (date.getMonth() + 1).toString() +
          //     "-" +
          //     date.getFullYear().toString();

          await fetchusersubject(document, date, mid, item.subject, isWeek);
        });
      } else {
        // setError("SUBJECT DOES NOT EXIST");
      }
    });
  };

  const fetchusersubject = async (document, date, mid, subject, isWeek) => {
    try {
      const subjectsdata = document["subjects"];
      await subjectsdata.map(async (item, index) => {
        if (item.subject === subject) {
          let gradetype,
            isSubmitted = false;
          if (date !== undefined) {
            if (mid === 1) {
              if (item.gradeStatus1 && item.mid_1) {
                gradetype = "Graded";
                isSubmitted = true;
              } else if (!item.gradeStatus1 && item.mid_1) {
                gradetype = "Submitted for Grading";
                isSubmitted = true;
              } else {
                gradetype = "Not Submitted";
              }
            } else {
              if (item.gradeStatus2 && item.mid_2) {
                gradetype = "Graded";
                isSubmitted = true;
              } else if (!item.gradeStatus2 && item.mid_2) {
                gradetype = "Submitted for Grading";
                isSubmitted = true;
              } else {
                gradetype = "Not Submitted";
              }
            }
          } else {
            gradetype = " ";
          }

          const resdata = {
            SUBJECT: item.subject,
            PRA_TOPIC: item.topic ? item.topic : " ",
            STATUS: gradetype,
            SUBMIT_BEFORE: date,
            IS_WEEK: isWeek,
            IS_SUBMITTED: isSubmitted,
          };
          setData((data) => [...data, resdata]);
        }
      });
    } catch {
      setError("ERROR OCCURED");
    }
  };

  useEffect(() => {
    fetchdata();
  }, []);

  console.log(data);

  return (
    <div className="main-body-subjects">
      <Navbar title={courseTitle} logout={true} back={false} />
      {!loading ? (
        error == null ? (
          <div className="subBody">
            {showDialog && (
              <Dialog
                message={showDialog}
                onOK={() => {
                  setShowDialog(false);
                }}
              />
            )}

            <div className="list-grid">
              {data &&
                data.map((dataitem) => (
                  <div
                    onClick={() => {
                      if (dataitem.STATUS != "Graded") {
                        navigate("/student/uploadPRA", {
                          state: {
                            rollno: `${currentUser.email}`,
                            subject: dataitem.SUBJECT,
                            course: course,
                            year: year,
                          },
                        });
                      } else {
                        setShowDialog("Cannot edit PRA after grading");
                      }
                    }}
                  >
                    <Card_
                      key={dataitem.SUBJECT}
                      subject={dataitem.SUBJECT}
                      pra={dataitem.PRA_TOPIC}
                      status={dataitem.STATUS}
                      date={dataitem.SUBMIT_BEFORE}
                      isWeek={dataitem.IS_WEEK}
                      isSubmitted={dataitem.IS_SUBMITTED}
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div>{error}</div>
        )
      ) : (
        <div>
          <LoadingScreen />
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
