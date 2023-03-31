import _ from 'lodash';
export const dockerComposeProcessHandler = (childProcess, cb) => {
    const containersInfo = new Map();
    console.log('docker_compose !!!');
    childProcess.on('close', (code, signal) => {
        // console.log({ exitCode: code, isDone: code === 0 ? true : false })
        if (code !== null)
            cb({ dockerComposeExitCode: code });
    });
    childProcess.stdout?.on('data', (chunk) => {
        const stepList = containersBuildStepList(chunk);
        const percents = getDockerComposeProcessPercents(stepList, containersInfo);
        if (percents)
            cb({ dockerComposePercent: percents });
    });
};
const getDockerComposeProcessPercents = (stepList, containersInfo) => {
    let totalSteps = 0;
    if (stepList) {
        stepList.map((containerBuildStepInfo) => {
            if (containerBuildStepInfo && containerBuildStepInfo.currentImageSteps) {
                totalSteps = Number(containerBuildStepInfo.currentImageSteps.totalSteps);
                containersInfo.set(containerBuildStepInfo.imageName, containerBuildStepInfo);
            }
        });
    }
    if (containersInfo.size !== 0 && totalSteps !== 0) {
        const avegareCurrentStep = _.mean(Array.from(containersInfo)
            .map(([v, a]) => a.currentImageSteps.currentStep)
            .map(Number));
        return _.round((avegareCurrentStep / totalSteps) * 100);
    }
};
const containersBuildStepList = (data) => {
    // example of regexp below: [ `#12 [image-name 4/6]` ]
    const matchList = data.match(/#\d{1,} \[\S+ \d{1,}\/\d{1,}\]/gm);
    return matchList
        ?.map((match) => match.replace(/\[/g, '').replace(/\]/g, ''))
        .map((match) => {
        const matchElements = match.split(' ');
        if (matchElements.length === 3) {
            return matchElements.map(() => ({
                globalStep: matchElements[0],
                imageName: matchElements[1],
                currentImageSteps: matchElements[2]
                    .trim()
                    .split('/')
                    .map((v, i, stepValues) => {
                    if (stepValues.length === 2)
                        return {
                            currentStep: stepValues[0],
                            totalSteps: stepValues[1],
                        };
                })[0],
            }));
        }
    })
        .flat();
};
