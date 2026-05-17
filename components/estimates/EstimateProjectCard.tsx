interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ProjectImage {
  id: string;
  url: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  mainImageUrl?: string;
  images: ProjectImage[];
  lineItems: LineItem[];
}

interface EstimateProjectCardProps {
  project: Project;
}

export function EstimateProjectCard({ project }: EstimateProjectCardProps) {
  const total = project.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-2">{project.name}</h3>

      {project.description && (
        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
      )}

      {/* Main Image */}
      {project.mainImageUrl && (
        <img 
          src={project.mainImageUrl} 
          className="w-full rounded mb-3" 
          alt={project.name}
        />
      )}

      {/* Gallery */}
      {project.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {project.images.map((img) => (
            <img 
              key={img.id} 
              src={img.url} 
              className="rounded w-full h-24 object-cover" 
              alt="Project"
            />
          ))}
        </div>
      )}

      {/* Line Items */}
      <div className="border-t pt-3">
        {project.lineItems.map((item) => (
          <div key={item.id} className="flex justify-between mb-2 text-sm">
            <span>{item.name}</span>
            <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t">
        <span>Project Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}