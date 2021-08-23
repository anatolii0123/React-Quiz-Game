import React, { useState, useEffect } from "react"
import { Modal } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles((theme) => ({
  root: {
    // margin: "10px",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10, 10),
    borderRadius: "20px",
    // display:"flex",
    // alignItems:"center",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
}))

const Marks = ({ students, showModal }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(showModal)

  useEffect(() => {
    setOpen(showModal)
  }, [showModal])

  return (
    <div className={classes.root}>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={showModal}
        disableEnforceFocus={true}
      >
        <div className={classes.paper}>
          <table>
            <thead>
              <th>Name</th>
              <th>Mark</th>
            </thead>
            {
              students.map(std => <tr key={std.id}>
                <td>{std.name}</td>
                <td>{std.mark}</td>
              </tr>)
            }
          </table>
        </div>
      </Modal>
    </div>
  )
}

export default Marks