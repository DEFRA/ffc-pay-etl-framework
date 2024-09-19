const { Etl, Loaders, Transformers, Destinations } = require("ffc-pay-etl-framework")

let csvFile = `${process.cwd()}/test/fixtures/Monthly_Rainfall.csv`

const columns = [
    "Dist Code","Year",
    "State Code",
    "State Name",
    "Dist Name",
    "JANUARY RAINFALL (Millimeters)",
    "FEBRUARY RAINFALL (Millimeters)",
    "MARCH RAINFALL (Millimeters)",
    "APRIL RAINFALL (Millimeters)",
    "MAY RAINFALL (Millimeters)",
    "JUNE RAINFALL (Millimeters)",
    "JULY RAINFALL (Millimeters)",
    "AUGUST RAINFALL (Millimeters)",
    "SEPTEMBER RAINFALL (Millimeters)",
    "OCTOBER RAINFALL (Millimeters)",
    "NOVEMBER RAINFALL (Millimeters)",
    "DECEMBER RAINFALL (Millimeters)",
    "ANNUAL RAINFALL (Millimeters)"
]

const etl = new Etl.Etl()

etl
.loader(Loaders.CSVLoader({path: csvFile, columns: columns}))
.transform(new Transformers.StringReplaceTransformer([
    { column: "JANUARY RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "FEBRUARY RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "MARCH RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "APRIL RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "MAY RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "JUNE RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "JULY RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "AUGUST RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "SEPTEMBER RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "OCTOBER RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "NOVEMBER RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
    { column: "DECEMBER RAINFALL (Millimeters)",
        find: ".",
        replace: ","
    },
]))
.destination(Destinations.CSVFileDestination({ 
    fileName: "SoilType_Output.csv", 
    headers: true, 
    includeErrors: false, 
    quotationMarks: true
}))
.pump()
