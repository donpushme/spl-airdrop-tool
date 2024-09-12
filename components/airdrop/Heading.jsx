export default function Heading({ steps }) {
    const onStepClass = "w-8 h-8 rounded-full bg-transparent border border-green flex justify-center items-center relative"
    const passedStepClass = "w-8 h-8 rounded-full bg-green border border-green flex justify-center items-center relative"
    const comingStepClass = "w-8 h-8 rounded-full bg-transparent border border flex justify-center items-center relative"

    const passedLineClass = "h-[1px] w-[calc(100%-32px)] rounded-full bg-green";
    const comingLineClass = "h-[1px] w-[calc(100%-32px)] rounded-full bg-gray-100/30"
    const noLineClass = "w-0"

    const passedTagClass = "text-green text-xs absolute -translate-x-1/2 left-1/2 top-[150%] w-[150px] text-center italic";
    const onTagClass = "text-xs absolute -translate-x-1/2 left-1/2 top-[150%] w-[150px] text-center italic";
    const comingTagClass = "text-gray-100/60 text-xs absolute -translate-x-1/2 left-1/2 top-[150%] w-[150px] text-center italic"

    const tags = ["Get Started", "Customize Allocation", "Execute Airdrop"];

    return (
        <div className="px-8">
            <div className="text-[50px] font-bold text-center">
                Airdrop Tokens
            </div>
            <div className="text-center px-[15%]">
                Simplify token distribution to your holders with our inttuitive airdrop tool, featuring advanced customization
            </div>
            <div className="flex gap-2 items-center justify-around mt-4 mb-10">
                {steps.map((step, index) => {
                    let stepClass;
                    let lineClass;
                    let tagClass;
                    if (!index) {
                        lineClass = noLineClass;
                        stepClass = step ? passedStepClass : onStepClass;
                        tagClass = step? passedTagClass: onTagClass;
                    }
                    if (!step && index && steps[index - 1]) {
                        lineClass = passedLineClass;
                        stepClass = onStepClass;
                        tagClass = onTagClass;
                    }
                    if (step && index) {
                        lineClass = passedLineClass;
                        stepClass = passedStepClass;
                        tagClass = passedTagClass;
                    }
                    if (!step && index && !steps[index - 1]) {
                        lineClass = comingLineClass;
                        stepClass = comingStepClass;
                        tagClass = comingTagClass;
                    }
                    return (
                        <div className={`flex items-center justify-between gap-2 ${ index == 0 ? "" : "w-[calc(50%-16px)]"}`} key={index}>
                            <div className={lineClass} ></div>
                            <div className={stepClass} >
                                <div className={tagClass}>
                                    {tags[index]}
                                </div>
                                {index + 1}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}