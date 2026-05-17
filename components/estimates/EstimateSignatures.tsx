interface Signature {
  id: string;
  url: string;
  date?: string;
  name?: string;
}

interface EstimateSignaturesProps {
  signatures: Signature[];
}

export function EstimateSignatures({ signatures }: EstimateSignaturesProps) {
  if (!signatures || signatures.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <p className="text-xs text-gray-500 mb-2">
        By signing, the customer agrees to the terms.
      </p>

      {signatures.map((sig) => (
        <div key={sig.id} className="mb-3">
          <img
            src={sig.url}
            className="w-full h-24 object-contain"
            alt="Customer signature"
          />
          {sig.date && (
            <p className="text-xs text-gray-400 mt-1">
              Signed on: {new Date(sig.date).toLocaleDateString()}
            </p>
          )}
          {sig.name && (
            <p className="text-xs text-gray-400">
              Signed by: {sig.name}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}