/*
*  copyright Jack Parmer 2017
*  MIT licensed
*/

import {transpose} from 'ramda';
import {DEFAULT_DATA, DEFAULT_LAYOUT, DEFAULT_COLORS} from './editorConstants';

export default function getPlotJsonFromState(state, props) {        
    let data = DEFAULT_DATA;
    let layout = DEFAULT_LAYOUT;

    // Get chart data from props
    const allColumnNames = props.columnNames;
    const rowData = props.rows;

    // Get chart configuration from state
    const {xAxisColumnName, yAxisColumnNames, columnTraceTypes}  = state;

    const colsWithTraceTypes = Object.keys(columnTraceTypes);

    if (typeof allColumnNames !== undefined && typeof rowData !== undefined) {            
        data = [];
        const columnData = transpose(rowData);            
        let yColName = '';
        let xColumnData;            
        let yColumnData;
        let traceColor;
        let traceType;            
        let dataObj;

        // eslint-disable-next-line
        yAxisColumnNames.map((yColName, i) => {
            
            const numColors = DEFAULT_COLORS.length;
            const colorWheelIndex = parseInt(numColors * (i/numColors), 10);
            traceColor = DEFAULT_COLORS[colorWheelIndex];
            dataObj = {};
            xColumnData = columnData[allColumnNames.indexOf(xAxisColumnName)];
            yColumnData = columnData[allColumnNames.indexOf(yColName)];

            // Get trace type
            if (colsWithTraceTypes.includes(yColName)) {
                traceType = columnTraceTypes[yColName];
            }

            const dataTemplate = {
                name: yColName,
                type: traceType,
                mode: traceType === 'line' || traceType === 'area' ? 'lines' : 'markers',
                fill: traceType === 'area' ? 'tozeroy' : null,                                       
            };

            dataObj = {x: xColumnData, y: yColumnData, marker: {color: traceColor}};

            if (traceType === 'choropleth' || traceType === 'scattergeo') {
                delete dataObj.x;
                delete dataObj.y;
                dataObj = {lat: xColumnData, lon: yColumnData};
            }
            else if (traceType === 'pie') {
                delete dataObj.x;
                delete dataObj.y;
                delete dataObj.marker.color
                let pieColors = [];
                Array(100).fill().map(i => pieColors = pieColors.concat(DEFAULT_COLORS));
                dataObj = {
                    values: xColumnData, 
                    labels: yColumnData,
                    marker: {colors: pieColors},
                    hole: 0.2,
                    pull: 0.05
                };
            }

            data.push(Object.assign(dataObj, dataTemplate));
        });

        layout['xaxis'] = {};
        layout['yaxis'] = {};
        layout['title'] = ' ';
        layout['xaxis']['title'] = xAxisColumnName;
        layout['xaxis']['zeroline'] = false;
        layout['yaxis']['zeroline'] = false;
        layout['xaxis']['showgrid'] = false;
        layout['barmode'] = 'stack';
        layout['yaxis']['title'] = ' ';
        layout['yaxis']['gridcolor'] = '#dfe8f3';
        layout['font'] = {color: '#506784', size: '12px'};  
        if (allColumnNames.length === 2) {
            layout['yaxis'] = {};
            layout['yaxis']['title'] = yColName;
        }

        if (data.length) {
            if (data[0].type === 'pie') {
                layout['yaxis']['showgrid'] = false;
                layout['yaxis']['showticklabels'] = false;
                layout['xaxis']['showticklabels'] = false;
                layout['xaxis']['title'] = ' ';
            }
        }
    }

    return {data: data, layout: layout}
}