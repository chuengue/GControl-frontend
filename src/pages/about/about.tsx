import { Box, Container, Paper, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import React from "react";

import packageJson from "../../../package.json";

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor:grey[900] }}>
        <Typography variant="h4" gutterBottom>
          Sobre o Aplicativo
        </Typography>
        <Typography variant="body1" paragraph>
          Este aplicativo foi desenvolvido para auxiliar jogadores de Grand Chase
          no gerenciamento e controle de farm. Ele não é afiliado, patrocinado ou
          endossado pela KOG.
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: blue[700], borderRadius: 1 }}>
          <Typography variant="body2" color="white">
            "Grand Chase" e todos os nomes, imagens e elementos visuais dos
            personagens são marcas registradas da KOG. Este aplicativo não é
            afiliado, patrocinado ou endossado pela KOG. Todo o conteúdo é
            utilizado apenas para fins informativos e de entretenimento. Caso
            haja alguma reivindicação de direitos, entre em contato para a
            remoção do conteúdo.
          </Typography>
        </Box>
        <Box sx={{ mt: 2, p: 2, bgcolor: blue[700], borderRadius: 1 }}>
          <Typography variant="body2" color="white">
            Algumas imagens e informações foram obtidas da Grand Chase Fandom Wiki,
            licenciadas sob CC-BY-SA 3.0.
          </Typography>
        </Box>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2">
            Desenvolvido por Eduardo Chuengue - Versão {packageJson.version}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
