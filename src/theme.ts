import { createMuiTheme } from "@material-ui/core";
import { grey, blue, red, purple } from "@material-ui/core/colors";

export const theme = createMuiTheme({
    palette: {
      primary: { main: '#212121' },
      secondary: {
          main: purple[500],
      },
      error: red,
    },
  });