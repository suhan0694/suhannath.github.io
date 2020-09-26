let cities
let statesJSON
let gunEvents
let gunFreq
let usData

const lowColor = '#fee0d2'
const highColor = '#de2d26'

const lowColor1 = '#fee6ce'
const highColor1 = '#e6550d'

let svg
let projection
let path
let state

let totalDeaths = []
let stateDeaths = []
let deathPerGender = []

let rScale
let spikeScale
let barScale
let choloroScale
let ageGroupScale

let spikeTip
let maleBarTip
let femaleBarTip

let spike

let stateColored
let spikeGroup
let allShootins
let maleGroup
let femaleGroup
let shootingBarTip

async function initD3GunMap() {
    statesJSON = await d3.json('../resource/freq2_by_state_updated.json')

    gunEvents = await d3.csv('../resource/gunEvents.csv')

    gunFreq = await d3.csv('../resource/frequency2.csv')

    usData = await d3.json('https://unpkg.com/us-atlas@3/counties-10m.json')

    const selectorBtn = document.getElementById('selectorBtn')

    selectorBtn.onclick = function () {
        const rbs = document.querySelectorAll('input[name="radio-button"]')
        let selectedValue
        for (const rb of rbs) {
            if (rb.checked) {
                selectedValue = rb.value
                break
            }
        }
        switch (selectedValue) {
            case 'SHOOTINGS':
                d3.selectAll('g').remove()
                allShooting()
                removeGradients()
                baseState()
                break
            case 'AGE':
                d3.selectAll('g').remove()
                coloredState()
                ageLegend()
                mapLegend()
                break
            case 'GENDER':
                d3.selectAll('g').remove()
                showGenderComp()
                removeGradients()
                baseState()
                break
            case 'DEATHS':
                d3.selectAll('g').remove()
                spikeMap()
                removeGradients()
                spikeMapLegend()
                baseState()
                break
        }
    }

    svg = d3.select('#map')
    projection = d3.geoAlbersUsa()
    path = d3.geoPath(projection)
    state = topojson.feature(usData, usData.objects.states)

    //Get total Deaths
    gunFreq.forEach((data) => totalDeaths.push(data.total_deaths))

    //Get Range for Males and Female Deaths
    statesJSON.forEach((data) => {
        deathPerGender.push(data.males)
        deathPerGender.push(data.females)
    })

    //Get Range for per state deaths
    statesJSON.forEach((data) => stateDeaths.push(data.males + data.females))

    rScale = d3.scaleLinear().domain(d3.extent(totalDeaths)).range([1, 4])

    spikeScale = d3.scaleLinear().domain(d3.extent(totalDeaths)).range([1, 50])

    barScale = d3
        .scaleLinear()
        .domain(d3.extent(deathPerGender))
        .range([5, 100])

    choloroScale = d3
        .scaleLinear()
        .domain(d3.extent(stateDeaths))
        .range([lowColor, highColor])

    ageGroupScale = d3
        .scaleLinear()
        .domain([0, 1200])
        .range([lowColor, highColor])

    spike = (length, width = 7) =>
        `M${-width / 2},0L0,${-length}L${width / 2},0`

    // add a legend for SVG Icons

    spikeTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>City:</strong> <span style='color:red'>
            ${d.names},${d.state}
            </span><br/>
            <strong>Total Deaths:</strong> <span style='color:red'>
                ${d.total_deaths}
                </span><br/>
                <strong>Male Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.males}
                </span><br/>
                <strong>Female Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.females}
                </span>
                `
        })

    maleBarTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>State:</strong> <span style='color:red'>
                ${d.state}
                </span><br/>
                <strong>Male Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.males}
                </span><br/>
                `
        })

    femaleBarTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>State:</strong> <span style='color:red'>
                ${d.state}
                </span><br/>
                <strong>Female Deaths:</strong> <span style='color:red; margin-top: 5px'>
                ${d.females}
                </span>
                `
        })

    shootingBarTip = d3
        .tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            return `<strong>Age:</strong> <span style='color:red'>
                ${d.age}
                </span><br/>
                <strong>Gender:</strong> <span style='color:red; margin-top: 5px'>
                ${d.gender}
                </span><br/>
                <strong>Date:</strong> <span style='color:red; margin-top: 5px'>
                ${d.date}
                </span>
                `
        })

    var zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on('zoom', function () {
            stateColored.attr('transform', d3.event.transform)
            maleGroup ? maleGroup.attr('transform', d3.event.transform) : ''
            femaleGroup ? femaleGroup.attr('transform', d3.event.transform) : ''
            allShootins ? allShootins.attr('transform', d3.event.transform) : ''
            spikeGroup ? spikeGroup.attr('transform', d3.event.transform) : ''
        })

    svg.call(zoom)
    svg.call(spikeTip)
    svg.call(maleBarTip)
    svg.call(femaleBarTip)
    svg.call(shootingBarTip)
}

function mapLegend() {
    //add a legend for Chloropeth map
    // add a legend
    const wMap = 140,
        hMap = 300

    const keyMap = d3
        .select('body')
        .append('svg')
        .attr('id', 'mapLegend')
        .attr('width', wMap)
        .attr('height', hMap)
        .attr('class', 'legend')

    const legendMap = keyMap
        .append('defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient1')
        .attr('x1', '100%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad')

    legendMap
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', highColor)
        .attr('stop-opacity', 1)

    legendMap
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', lowColor)
        .attr('stop-opacity', 1)

    keyMap
        .append('rect')
        .attr('width', wMap - 100)
        .attr('height', hMap)
        .style('fill', 'url(#gradient1)')
        .attr('transform', 'translate(0,10)')

    const y = d3.scaleLinear().range([hMap, 0]).domain([5, 1500])

    const yAxis = d3.axisRight(y)

    keyMap
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(41,10)')
        .call(yAxis)
}

function ageLegend() {
    const wSVG = 300,
        hSVG = 70

    const keySVG = d3
        .select('#svg-icon-legend')
        .attr('id', 'svgLegend')
        .attr('width', wSVG)
        .attr('height', hSVG)

    const legendSVG = keySVG
        .append('defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient2')
        .attr('x1', '100%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad')

    legendSVG
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', highColor1)
        .attr('stop-opacity', 1)

    legendSVG
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', lowColor1)
        .attr('stop-opacity', 1)

    keySVG
        .append('rect')
        .attr('width', wSVG)
        .attr('height', hSVG - 30)
        .style('fill', 'url(#gradient2)')
        .attr('transform', 'translate(0,10)')

    const x = d3.scaleLinear().range([0, wSVG]).domain([0, 1200])

    const xAxis = d3.axisBottom(x)

    keySVG
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,50)')
        .call(xAxis)
}

function coloredState() {
    svg = d3.select('#map')
    stateColored = svg.append('g')

    // load and display the World
    stateColored
        .selectAll('path')
        .data(state.features)
        .join('path')
        .attr('d', (f) => path(f))
        .attr('stroke', 'grey')
        .attr('fill', (d) => {
            const stateName = d.properties.name
            const stateObj = statesJSON.filter(
                (state) => state.NAME == stateName
            )
            return stateObj[0]
                ? choloroScale(stateObj[0].males + stateObj[0].females)
                : lowColor
        })
        .attr('stroke-width', 1)
        .attr('id', (d) => `state${d.id}`)
        .on('click', (d) => colorSvg(d))
    // .on('mouseover', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'red')
    //     //d3.selectAll('.states').attr('fill', 'red')
    // })
    // .on('mouseout', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'none')
    // })
}

function baseState() {
    svg = d3.select('#map')
    stateColored = svg.append('g')

    // load and display the World
    stateColored
        .selectAll('path')
        .data(state.features)
        .join('path')
        .attr('d', (f) => path(f))
        .attr('stroke', 'grey')
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('id', (d) => `state${d.id}`)
    // .on('mouseover', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'red')
    //     //d3.selectAll('.states').attr('fill', 'red')
    // })
    // .on('mouseout', (state, d) => {
    //     d3.select(`#state${state.id}`).attr('fill', 'none')
    // })
}

const colorSvg = (data) => {
    const stateObj = statesJSON.filter(
        (state) => state.NAME === data.properties.name
    )
    const oldMaleStat = stateObj[0].oldMales
    const oldFemaleStat = stateObj[0].oldFemales
    const youngStat = stateObj[0].youngMale + stateObj[0].youngFemale
    const teenStat = stateObj[0].teenMale + stateObj[0].teenFemale

    const man = document.getElementById('man')
    const female = document.getElementById('female')
    const young = document.getElementById('young')
    const teens = document.getElementById('teens')
    // Get the SVG document inside the Object tag
    const svgDocMan = man.contentDocument
    const svgDocFemale = female.contentDocument
    const svgDocYoung = young.contentDocument
    const svgDocTeens = teens.contentDocument
    // Get one of the SVG items by ID;
    const svgItemMan = svgDocMan.getElementById('man_svg')
    const svgItemFemale = svgDocFemale.getElementById('female_svg')
    const svgItemYoung = svgDocYoung.getElementById('young_svg')
    const svgItemTeens = svgDocTeens.getElementById('teen_svg')
    // Set the colour to something else
    svgItemMan.setAttribute('fill', ageGroupScale(oldMaleStat))
    svgItemFemale.setAttribute('fill', ageGroupScale(oldFemaleStat))
    svgItemYoung.setAttribute('fill', ageGroupScale(youngStat))
    svgItemTeens.setAttribute('fill', ageGroupScale(teenStat))
}

function showGenderComp() {
    maleGroup = svg.append('g')

    maleGroup
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .attr('id', 'spikePath')
        .selectAll('path')
        .data(statesJSON)
        .join('rect')
        .attr('height', function (d) {
            return barScale(d.males)
        })
        .attr('width', 10)
        .attr('y', function (d) {
            return -barScale(d.males)
        })
        .attr('class', 'bars')
        .style('fill', '#2959c9')
        .style('stroke', 'white')
        .style('stroke-width', 2)
        .attr(
            'transform',
            (d) =>
                `translate(${projection([d.lng, d.lat])[0] - 5}, ${
                    projection([d.lng, d.lat])[1]
                })`
        )
        .attr('d', (d) => spike(spikeScale(d.males)))
        .on('mouseover', maleBarTip.show)
        .on('mouseout', maleBarTip.hide)

    femaleGroup = svg.append('g')

    femaleGroup
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .attr('id', 'spikePath')
        .selectAll('path')
        .data(statesJSON)
        .join('rect')
        .attr('height', function (d) {
            return barScale(d.females)
        })
        .attr('width', 10)
        .attr('y', function (d) {
            return -barScale(d.females)
        })
        .attr('class', 'bars')
        .style('fill', '#c52d31')
        .style('stroke', 'white')
        .style('stroke-width', 2)
        .attr(
            'transform',
            (d) =>
                `translate(${projection([d.lng, d.lat])[0] + 5}, ${
                    projection([d.lng, d.lat])[1]
                })`
        )
        .attr('d', (d) => spike(spikeScale(d.females)))
        .on('mouseover', femaleBarTip.show)
        .on('mouseout', femaleBarTip.hide)
}

function allShooting() {
    allShootins = svg.append('g')
    allShootins
        .selectAll('circle')
        .data(gunEvents)
        .join('circle')
        .attr('cx', (d) => projection([d.lng, d.lat])[0])
        .attr('cy', (d) => projection([d.lng, d.lat])[1])
        .attr('r', (d) => 2)
        .attr('fill', (d) => (d.gender === 'M' ? '#2959c9' : '#c52d31'))
        .on('mouseover', shootingBarTip.show)
        .on('mouseout', shootingBarTip.hide)
}

function spikeMap() {
    spikeGroup = svg.append('g')

    spikeGroup
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .selectAll('path')
        .data(gunFreq)
        .join('path')
        .attr(
            'transform',
            (d) =>
                `translate(${projection([d.lng, d.lat])[0]}, ${
                    projection([d.lng, d.lat])[1]
                })`
        )
        .attr('d', (d) => spike(spikeScale(d.total_deaths)))
        .on('mouseover', spikeTip.show)
        .on('mouseout', spikeTip.hide)
}

function spikeMapLegend() {
    const legend = svg
        .append('g')
        .attr('fill', '#777')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('g')
        .data(spikeScale.ticks(4).reverse())
        .join('g')
        .attr('transform', (d, i) => `translate(${900 - (i + 1) * 18},500)`)

    legend
        .append('path')
        .attr('fill', 'red')
        .attr('fill-opacity', 0.3)
        .attr('stroke', 'red')
        .attr('d', (d) => spike(spikeScale(d)))

    legend
        .append('text')
        .attr('dy', '1.3em')
        .text(spikeScale.tickFormat(4, 's'))
}

function removeGradients() {
    d3.select('#gradient1').remove()
    d3.select('#gradient2').remove()
}
