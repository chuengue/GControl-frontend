import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import React from 'react';

const ConfirmationModal = ({ open, onClose, title, message, onConfirm }) => {
   return (
      <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      sx={{
         "& .MuiPaper-root": {
            color:grey[900],
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px"
         }
      }}
   >
      <DialogTitle 
         id="confirmation-dialog-title" 
         sx={{ fontWeight: "bold", textAlign: "center", 


          }}
      >
         {title}
      </DialogTitle>
      <DialogContent>
         <DialogContentText sx={{ color: grey[900], textAlign: "center"
            
          }}>
            {message}
         </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
         <Button 
            onClick={onClose} 
            variant="outlined" 
            sx={{ borderRadius: "8px",

               color: blue[600]
             }}
         >
            Cancelar
         </Button>
         <Button 
            onClick={onConfirm} 
            variant="contained" 
            sx={{ backgroundColor: blue[600], borderRadius: "8px" , color:"white"}}
            autoFocus
         >
            Confirmar
         </Button>
      </DialogActions>
   </Dialog>
   
   );
};

export default ConfirmationModal;
