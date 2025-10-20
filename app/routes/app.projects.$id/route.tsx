import { useEffect, useState } from "react";
import { useActionData, useLoaderData, useNavigate, useParams, useSubmit } from "react-router";

import { ProjectStatus } from "@prisma/client";

import { loader } from "./.server/loader";
import { action } from "./.server/action";

export { loader, action };

const statusOptions = Object.values(ProjectStatus).map(status => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status
}));

export default function ProjectForm() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { payload: project } = useLoaderData<typeof loader>();
    const [ initialFormState, setInitialFormState ] = useState(project);
    const [ formState, setFormState ] = useState(project);
    const errors = useActionData()?.errors || {};
    // const isSaving = useNavigation().state === "submitting";
    const isDirty = JSON.stringify(formState) !== JSON.stringify(initialFormState);

    const submit = useSubmit();

    function handleSave (e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(formState).forEach(([ key, value ]) => {
            if (key === "createdAt" || key === "updatedAt") return;
            if (value !== undefined && value !== null) {
                formData.set(key, String(value));
            }
        });
        submit(formData, { method: "post" });
    }

    function handleDelete () {
        submit({ action: "delete" }, { method: "post" });
    }

    function handleReset () {
        setFormState(initialFormState);
        window.shopify.saveBar.hide("project-form");
    }

    useEffect(() => {
        if (isDirty) {
            window.shopify.saveBar.show("project-form");
        } else {
            window.shopify.saveBar.hide("project-form");
        }
        return () => {
            window.shopify.saveBar.hide("project-form");
        };
    }, [ isDirty ]);

    useEffect(() => {
        setInitialFormState(project);
        setFormState(project);
    }, [id, project]);

    return (
        <>
            <form data-save-bar onSubmit={handleSave} onReset={handleReset}>
                <s-page heading={initialFormState?.name || "Create a project"}>
                    <s-link
                        href="/app"
                        slot="breadcrumb-actions"
                        onClick={(e) => (isDirty ? e.preventDefault() : navigate("/app/"))}
                    >
                        Projects
                    </s-link>
                    
                    {('id' in initialFormState) && <s-button slot="secondary-actions" type="button" onClick={handleDelete}>Delete</s-button>}
                    
                    <s-section heading="Details">
                        <s-stack gap="base">
                            <s-text-field
                                label="Name"
                                details="Only store staff can see this name"
                                error={errors.name}
                                name="name"
                                value={formState.name}
                                onInput={(e) => setFormState({ ...formState, name: e.currentTarget.value })}
                                required
                            />
                            
                            <s-url-field
                                label="Image URL"
                                details="Copy and paste link to your preferred image."
                                placeholder="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                error={errors.image}
                                name="image"
                                onInput={(e) => setFormState({ ...formState, image: e.currentTarget.value })}
                                value={formState?.image || ""}
                            />

                            <s-text-area
                                label="Description"
                                name="description"
                                value={formState?.description || ''}
                                rows={3}
                                onInput={(e) => setFormState({...formState, description: e.currentTarget.value})}
                            />
                        </s-stack>
                    </s-section>

                    <s-section heading="Customizations">
                        <s-stack gap="base">
                            <s-text-area
                                label="Message"
                                name="message"
                                value={formState.message || ''}
                                rows={3}
                                onInput={(e) => setFormState({...formState, message: e.currentTarget.value})}
                            />

                            <s-text-field
                                label="Created By"
                                details="The author of your product. Visible on frontend."
                                error={errors.createdBy}
                                name="createdBy"
                                value={formState.createdBy || ""}
                                onInput={(e) => setFormState({ ...formState, createdBy: e.currentTarget.value })}
                                required
                            />

                            <s-text-field
                                label="Firmness"
                                details="It'll display to customers encouraging product selection."
                                error={errors.createdBy}
                                name="firmness"
                                value={formState.firmness || ""}
                                onInput={(e) => setFormState({ ...formState, firmness: e.currentTarget.value })}
                                required
                            />

                            <s-text-field
                                label="Label"
                                details="Customers will see this."
                                error={errors.label}
                                name="label"
                                value={formState?.label || ""}
                                onInput={(e) => setFormState({ ...formState, label: e.currentTarget.value })}
                                required
                            />

                            <s-text-field
                                label="Question"
                                details="Customers will see this."
                                error={errors.question}
                                name="question"
                                value={formState?.question || ""}
                                onInput={(e) => setFormState({ ...formState, question: e.currentTarget.value })}
                                required
                            />
                        </s-stack>
                    </s-section>

                    <s-box slot="aside">
                        <s-section heading="Status">
                            <s-stack gap="base">
                                <s-select
                                    label="Status"
                                    labelAccessibilityVisibility="exclusive"
                                    error={errors.status}
                                    name="status"
                                    value={formState.status}
                                    onChange={(e) => {
                                        const val = e.currentTarget.value;
                                        if (isProjectStatus(val))
                                            setFormState({ ...formState, status: val })
                                    }}
                                >
                                    {statusOptions.map((opt, idx) => (
                                        <s-option key={idx} value={opt.value} defaultSelected>{opt.label}</s-option>
                                    ))}
                                </s-select>
                            </s-stack>
                        </s-section>
                    </s-box>
                </s-page>
            </form>
        </>
    );
    
}

function isProjectStatus (key: string): key is ProjectStatus {
    return Object.values(ProjectStatus).some(status => status === key);
}